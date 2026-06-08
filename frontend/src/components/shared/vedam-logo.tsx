import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-7 w-auto min-w-[96px] max-w-[128px]",
  md: "h-8 w-auto min-w-[108px] max-w-[148px]",
  lg: "h-9 w-auto min-w-[120px] max-w-[168px]",
  xl: "h-10 w-auto min-w-[132px] max-w-[188px]",
} as const;

type VedamLogoSize = keyof typeof sizeClasses;

interface VedamLogoProps {
  size?: VedamLogoSize;
  className?: string;
  priority?: boolean;
  /** Light panel behind logo — use on dark backgrounds (default). */
  onDark?: boolean;
}

export function VedamLogo({
  size = "md",
  className,
  priority = false,
  onDark = true,
}: VedamLogoProps) {
  const image = (
    <Image
      src="/vedam-logo.webp"
      alt="Vedam School of Technology"
      width={200}
      height={56}
      className={cn(sizeClasses[size], "object-contain object-left")}
      priority={priority}
    />
  );

  if (!onDark) {
    return <span className={cn("inline-flex shrink-0", className)}>{image}</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-lg bg-white px-3 py-1.5 shadow-md shadow-black/20 ring-1 ring-black/5",
        className
      )}
    >
      {image}
    </span>
  );
}
