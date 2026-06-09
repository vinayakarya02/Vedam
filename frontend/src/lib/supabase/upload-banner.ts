import { createClient } from "@/lib/supabase/client";

const BUCKET = "event-banners";
const MAX_SIZE_MB = 5;

// Fallback map for browsers/OSes that don't set file.type (any image extension).
const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  ico: "image/x-icon",
  heic: "image/heic",
  heif: "image/heif",
};

function inferMimeType(file: File): string {
  if (file.type && file.type.startsWith("image/")) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return MIME_BY_EXT[ext] || "";
}

function fileExtension(file: File, mimeType: string): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  const sub = mimeType.split("/")[1]?.split("+")[0];
  return sub && /^[a-z0-9]+$/.test(sub) ? sub : "img";
}

/**
 * Upload a banner straight to Supabase Storage from the browser using the
 * admin's authenticated session. This avoids proxying a multi-MB binary
 * through the Next.js rewrite + backend (which was failing on Render), and
 * relies on the "Admins upload banners" storage RLS policy.
 */
export async function uploadEventBanner(file: File): Promise<string> {
  const mimeType = inferMimeType(file);
  if (!mimeType) {
    throw new Error("Please upload an image file");
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image must be under ${MAX_SIZE_MB}MB`);
  }

  const supabase = createClient();
  const ext = fileExtension(file, mimeType);
  const path = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: mimeType,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || "Upload failed");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error("Could not get image URL");
  }

  return data.publicUrl;
}
