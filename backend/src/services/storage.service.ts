import { createAdminClient } from "../lib/supabase.js";

const BUCKET = "event-banners";
const MAX_BYTES = 5 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function inferMimeType(filename: string, contentType?: string): string {
  const normalized = contentType?.split(";")[0]?.trim().toLowerCase();
  if (normalized && EXT_BY_MIME[normalized]) return normalized;
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return MIME_BY_EXT[ext] || "image/jpeg";
}

async function ensureBannerBucket() {
  const supabase = createAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw new Error(listError.message);

  if (buckets?.some((b) => b.name === BUCKET || b.id === BUCKET)) return;

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
  });
  if (createError && !createError.message.includes("already exists")) {
    throw new Error(createError.message);
  }
}

export async function uploadEventBanner(
  buffer: Buffer,
  filename: string,
  contentType?: string
): Promise<string> {
  if (!buffer.length) throw new Error("Empty file");
  if (buffer.length > MAX_BYTES) throw new Error("Image must be under 5MB");

  const mimeType = inferMimeType(filename, contentType);
  if (!EXT_BY_MIME[mimeType]) {
    throw new Error("Please upload a JPG, PNG, WebP, or GIF image");
  }

  await ensureBannerBucket();

  const ext = EXT_BY_MIME[mimeType];
  const path = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mimeType,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(error.message || "Upload failed");

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data.publicUrl) throw new Error("Could not build banner URL");

  return data.publicUrl;
}
