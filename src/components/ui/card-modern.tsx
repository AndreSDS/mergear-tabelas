import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-2xl border transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground shadow-sm hover:shadow-md",
        gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-xl",
        elevated: "bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl hover:-translate-y-1",
        glass: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 shadow-xl",
        colorful: "bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 border-violet-200/50",
        emerald: "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border-emerald-200/50",
      },
      padding: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

interface CardModernProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function CardModern({ className, variant, padding, ...props }: CardModernProps) {
  return (
    <div className={cn(cardVariants({ variant, padding, className }))} {...props} />
  );
}