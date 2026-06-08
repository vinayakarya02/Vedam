import { createAdminClient } from "../lib/supabase.js";

const BUCKET = "event-banners";
const MAX_BYTES = 5 * 1024 * 1024;

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

function inferMimeType(filename: string, contentType?: string): string {
  const normalized = contentType?.split(";")[0]?.trim().toLowerCase();
  if (normalized && normalized.startsWith("image/")) return normalized;
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return MIME_BY_EXT[ext] || "";
}

// Derive a storage file extension from the mime subtype (e.g. image/svg+xml -> svg)
// or the original filename, falling back to "img".
function extFromMime(mimeType: string, filename: string): string {
  const fromName = filename.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  const sub = mimeType.split("/")[1]?.split("+")[0];
  return sub && /^[a-z0-9]+$/.test(sub) ? sub : "img";
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
  if (!mimeType.startsWith("image/")) {
    throw new Error("Please upload an image file");
  }

  await ensureBannerBucket();

  const ext = extFromMime(mimeType, filename);
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
