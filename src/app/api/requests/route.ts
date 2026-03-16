import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth-v2";
import type { RecipeRequestDoc } from "@/types/recipe-request";
import { sendRequestNotification } from "@/lib/email";
import { getMemberRecipeRequestStatus } from "@/lib/member-request";
import { deductMemberCredits, recordCreditUsage } from "@/lib/member-credits";
import { validateOrThrow, recipeRequestSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logger, apiError } from "@/lib/logger";

const COLLECTION = "recipe_requests";

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per 10 minutes per IP
  const ip = getClientIp(request);
  const rl = rateLimit(`recipe-request:${ip}`, { limit: 5, windowSec: 10 * 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak request. Coba lagi sebentar." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { name, recipeName, message } = validateOrThrow(recipeRequestSchema, body);

    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Silakan masuk sebagai member untuk mengirim request resep", code: "MEMBER_REQUIRED" },
        { status: 401 }
      );
    }

    const memberSession = {
      id: session.id,
      name: session.name,
      email: session.email,
      credits: session.credits || (session.role === "admin" ? 999 : 0)
    };

    const db = await getDb();
    const col = db.collection<RecipeRequestDoc>(COLLECTION);
    const requestStatus = await getMemberRecipeRequestStatus(db, memberSession.id);

    if (!requestStatus.canRequest) {
      return NextResponse.json(
        {
          error: "Kamu tidak memiliki Credit yang cukup untuk merequest resep. Silakan kumpulkan Credit atau Top Up paket Credits.",
          code: "REQUEST_QUOTA_EXCEEDED",
          requestStatus,
        },
        { status: 403 }
      );
    }

    if (memberSession.id !== "admin") {
      const deducted = await deductMemberCredits(db, memberSession.id, 1);
      if (!deducted) {
         return NextResponse.json({ error: "Gagal memproses Credit" }, { status: 500 });
      }
    }

    const doc: Omit<RecipeRequestDoc, "_id"> = {
      memberId: memberSession.id,
      memberEmail: memberSession.email,
      name: name.trim(),
      recipeName: recipeName.trim(),
      message: message?.trim() || undefined,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await col.insertOne(doc as RecipeRequestDoc);

    if (memberSession.id !== "admin") {
      await recordCreditUsage(db, memberSession.id, {
        action: "recipe_request",
        amount: 1,
        description: `Recipe request: ${recipeName}`,
        metadata: { recipeName },
      });
    }

    // Kirim notifikasi email ke admin (non-blocking)
    sendRequestNotification({
      name: doc.name,
      recipeName: doc.recipeName,
      message: doc.message,
      memberId: memberSession.id,
    }).catch((err) => logger.error("Gagal kirim notifikasi email request", "EMAIL", err));

    const updatedRequestStatus = await getMemberRecipeRequestStatus(db, memberSession.id);

    return NextResponse.json(
      { _id: result.insertedId.toString(), ...doc, requestStatus: updatedRequestStatus },
      { status: 201 }
    );
  } catch (e) {
    return apiError("REQUEST_POST", e, "Gagal mengirim request");
  }
}

// Admin: get all requests
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const col = db.collection<RecipeRequestDoc>(COLLECTION);
    const list = await col.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(list.map((r) => ({ ...r, _id: r._id?.toString() })));
  } catch (e) {
    return apiError("REQUEST_GET", e, "Gagal mengambil data");
  }
}
