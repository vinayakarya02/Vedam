import { clientApiUpload } from "@/lib/api-client";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function inferMimeType(file: File): string {
  if (file.type && ALLOWED_TYPES.includes(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return MIME_BY_EXT[ext] || "";
}

export async function uploadEventBanner(file: File): Promise<string> {
  const mimeType = inferMimeType(file);
  if (!mimeType) {
    throw new Error("Please upload a JPG, PNG, WebP, or GIF image");
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image must be under ${MAX_SIZE_MB}MB`);
  }

  let res: Response;
  try {
    res = await clientApiUpload("/api/admin/upload/banner", file, mimeType);
  } catch {
    throw new Error(
      "Cannot reach the API. From the project root run `npm run dev` (backend on port 4000 + frontend on 3000), then reload this page."
    );
  }
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Upload failed"
    );
  }

  if (!data.url || typeof data.url !== "string") {
    throw new Error("Invalid response from server");
  }

  return data.url;
}
