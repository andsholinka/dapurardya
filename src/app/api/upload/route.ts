import { NextRequest, NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth-v2";
import { v2 as cloudinary } from "cloudinary";
import { apiError } from "@/lib/logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
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
    });

    return NextResponse.json({
      url: result.secure_url,
      width: result.width,
      height: result.height,
    });
  } catch (e) { return apiError("UPLOAD", e, "Gagal upload gambar"); }
}
