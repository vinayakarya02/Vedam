"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadEventBanner } from "@/lib/supabase/upload-banner";

interface BannerUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function BannerUpload({ value, onChange }: BannerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadEventBanner(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2 md:col-span-2">
      <Label>Event Banner</Label>
      <div className="flex flex-col sm:flex-row gap-4">
        {value ? (
          <div className="relative w-full sm:w-48 h-28 rounded-lg overflow-hidden border border-white/10 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Banner preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80"
              aria-label="Remove banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="w-full sm:w-48 h-28 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-muted-foreground text-xs">
            No banner yet
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Uploading..." : value ? "Replace image" : "Upload image"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Any image format · max 5MB
          </p>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
