import { NextRequest, NextResponse } from "next/server";
import { getSession, setAuthCookie } from "@/lib/auth-v2";
import { getDb, tryConvertObjectId } from "@/lib/mongodb";
import { getMemberAIUsageStatus } from "@/lib/member-ai";
import { deductMemberCredits, recordCreditUsage } from "@/lib/member-credits";
import { generateIcon, type IconPerspective } from "@/lib/imagen";
import { apiError } from "@/lib/logger";
import crypto from "crypto";

// Simple in-memory cache: hash(prompt) → { url, expiresAt }
const iconCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 jam

function getCached(prompt: string): string | null {
  const key = crypto.createHash("sha256").update(prompt.toLowerCase().trim()).digest("hex");
  const entry = iconCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { iconCache.delete(key); return null; }
  return entry.url;
}

function setCache(prompt: string, url: string) {
  const key = crypto.createHash("sha256").update(prompt.toLowerCase().trim()).digest("hex");
  if (iconCache.size > 500) {
    const first = iconCache.keys().next().value;
    if (first) iconCache.delete(first);
  }
  iconCache.set(key, { url, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Fitur Icon Studio hanya untuk member. Silakan masuk dulu.", code: "MEMBER_REQUIRED" },
        { status: 401 }
      );
    }

    // Support both JSON (text only) and FormData (with image)
    let prompt = "";
    let perspective = "isometric";
    let referenceImageBase64: string | undefined;
    let referenceImageMimeType: string | undefined;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      prompt = (formData.get("prompt") as string) || "";
      perspective = (formData.get("perspective") as string) || "isometric";
      const file = formData.get("image") as File | null;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        referenceImageBase64 = buffer.toString("base64");
        referenceImageMimeType = file.type;
      }
    } else {
      const body = await request.json();
      prompt = body.prompt || "";
      perspective = body.perspective || "isometric";
    }

    // prompt is optional when image is provided
    if (!referenceImageBase64 && (!prompt || typeof prompt !== "string" || prompt.trim().length === 0)) {
      return NextResponse.json({ error: "Deskripsi icon diperlukan" }, { status: 400 });
    }
    if (prompt.trim().length > 200) {
      return NextResponse.json({ error: "Deskripsi maksimal 200 karakter" }, { status: 400 });
    }

    const validPerspectives: IconPerspective[] = ["isometric", "front", "back", "side", "three-quarter", "top-down"];
    const safePerspective: IconPerspective = validPerspectives.includes(perspective as IconPerspective) ? perspective as IconPerspective : "isometric";

    const db = await getDb();

    // Cek kredit — butuh minimal 5, skip untuk admin
    if (session.role !== "admin") {
      const usageStatus = await getMemberAIUsageStatus(db, session.id);
      if (usageStatus.credits < 5) {
        return NextResponse.json(
          {
            error: "Generate icon membutuhkan 5 Credits. Silakan Top Up paket Credits.",
            code: "INSUFFICIENT_CREDITS",
            credits: usageStatus.credits,
          },
          { status: 403 }
        );
      }
    }

    // Cek cache — key includes perspective, skip if image provided
    if (!referenceImageBase64) {
      const cached = getCached(prompt + "|" + safePerspective);
      if (cached) {
        const usageStatus = await getMemberAIUsageStatus(db, session.id);
        return NextResponse.json({ url: cached, fromCache: true, credits: usageStatus.credits, isAdmin: session.role === "admin" });
      }
    }

    const url = await generateIcon(prompt, safePerspective, referenceImageBase64, referenceImageMimeType);
    if (!referenceImageBase64) setCache(prompt + "|" + safePerspective, url);

    // Simpan ke MongoDB
    const memberId = tryConvertObjectId(session.id);
    if (memberId) {
      await db.collection("member_icons").insertOne({
        memberId,
        url,
        prompt: prompt.trim(),
        perspective: safePerspective,
        hasReferenceImage: !!referenceImageBase64,
        createdAt: new Date(),
      });
    }

    // Potong 5 kredit untuk member (bukan admin)
    if (session.role !== "admin") {
      const deducted = await deductMemberCredits(db, session.id, 5);
      if (!deducted) {
        return NextResponse.json({ error: "Gagal memproses Credit" }, { status: 500 });
      }
      await recordCreditUsage(db, session.id, {
        action: "icon_generate",
        amount: 5,
        description: `Icon Studio: "${prompt.trim().slice(0, 50)}"`,
        metadata: { prompt: prompt.trim() },
      });
    }

    const usageStatus = await getMemberAIUsageStatus(db, session.id);

    // Update cookie session agar credits di header sync
    await setAuthCookie({ ...session, credits: usageStatus.credits });

    return NextResponse.json({ url, fromCache: false, credits: usageStatus.credits, isAdmin: session.role === "admin" });
  } catch (error) {
    return apiError("ICON_STUDIO", error, "Gagal generate icon");
  }
}
