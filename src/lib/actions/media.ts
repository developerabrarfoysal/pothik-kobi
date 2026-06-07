"use server";

import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth";
import { revalidatePublicContent } from "@/lib/cache";
import { mediaUpdateSchema } from "@/lib/validations";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function uploadMedia(formData: FormData) {
  const session = await requireAdmin();
  const file = formData.get("file") as File | null;

  if (!file) throw new Error("ফাইল পাওয়া যায়নি");
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("শুধুমাত্র ছবি ফাইল অনুমোদিত");
  if (file.size > MAX_FILE_SIZE) throw new Error("ফাইলের আকার ১০MB এর কম হতে হবে");

  const buffer = Buffer.from(await file.arrayBuffer());
  let width: number | undefined;
  let height: number | undefined;
  let outputBuffer = buffer;
  let mimeType = file.type;

  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    width = metadata.width;
    height = metadata.height;

    if (file.type !== "image/gif") {
      outputBuffer = Buffer.from(await image.webp({ quality: 85 }).toBuffer());
      mimeType = "image/webp";
    }
  } catch {
    // keep original if sharp fails
  }

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const blobPath = `media/${filename}${mimeType === "image/webp" ? ".webp" : ""}`;

  let storageUrl: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(blobPath, outputBuffer, {
      access: "public",
      contentType: mimeType,
    });
    storageUrl = blob.url;
  } else if (process.env.NODE_ENV === "production") {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN প্রয়োজন। প্রোডাকশনে Vercel Blob ছাড়া ছবি আপলোড করা যাবে না।"
    );
  } else {
    if (outputBuffer.length > 500_000) {
      throw new Error("ডেভ মোডে ৫০০KB এর বেশি ছবি আপলোড করা যাবে না। Vercel Blob সেট করুন।");
    }
    console.warn("[media] BLOB_READ_WRITE_TOKEN missing — storing dev-only base64 (never use in production DB)");
    const base64 = outputBuffer.toString("base64");
    storageUrl = `data:${mimeType};base64,${base64}`;
  }

  const asset = await prisma.mediaAsset.create({
    data: {
      filename: blobPath,
      originalName: file.name,
      mimeType,
      size: outputBuffer.length,
      width,
      height,
      storageUrl,
      altText: file.name.replace(/\.[^.]+$/, ""),
    },
  });

  await logAudit(session.userId, "UPLOAD", "MediaAsset", asset.id);
  revalidatePublicContent();
  return asset;
}

export async function updateMedia(id: string, data: unknown) {
  const session = await requireAdmin();
  const parsed = mediaUpdateSchema.parse(data);
  const asset = await prisma.mediaAsset.update({ where: { id }, data: parsed });
  await logAudit(session.userId, "UPDATE", "MediaAsset", id);
  revalidatePublicContent();
  return asset;
}

export async function deleteMedia(id: string) {
  const session = await requireAdmin();
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) throw new Error("মিডিয়া পাওয়া যায়নি");

  if (asset.storageUrl.startsWith("https://") && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(asset.storageUrl);
    } catch {
      // blob may already be deleted
    }
  }

  await prisma.mediaAsset.delete({ where: { id } });
  await logAudit(session.userId, "DELETE", "MediaAsset", id);
  revalidatePublicContent();
}

export async function getMediaLibrary(page = 1, limit = 24) {
  await requireAdmin();
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.mediaAsset.count(),
  ]);
  return { items, total, pages: Math.ceil(total / limit) };
}

export async function getAllMedia() {
  await requireAdmin();
  return prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
}
