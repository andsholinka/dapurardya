import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, getMemberSession } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const [isAdmin, member] = await Promise.all([getAdminSession(), getMemberSession()]);
  if (!isAdmin && !member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "dapurardya",
      transformation: [{ width: 800, height: 600, crop: "limit", quality: "auto" }],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (e) {
    console.error("[UPLOAD] Error:", e);
    return NextResponse.json({ error: "Gagal upload gambar" }, { status: 500 });
  }
}
