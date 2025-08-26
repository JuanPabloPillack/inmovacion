import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No se subió archivo" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "inmuebles" },
      (error, result) => {
        if (error) {
          reject(NextResponse.json({ error }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ url: result?.secure_url }));
        }
      }
    );
    uploadStream.end(buffer);
  });
}
