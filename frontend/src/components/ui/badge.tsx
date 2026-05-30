import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-vedam-orange/20 text-vedam-orange",
        secondary: "border-transparent bg-white/10 text-foreground",
        outline: "border-white/20 text-foreground",
        success: "border-transparent bg-green-500/20 text-green-400",
        purple: "border-transparent bg-vedam-purple/20 text-vedam-purple",
        cyan: "border-transparent bg-vedam-cyan/20 text-vedam-cyan",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
