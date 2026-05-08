import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  animationDelay?: 0 | 1 | 2 | 3;
}

export default function SectionCard({
  title,
  icon: Icon,
  children,
  className,
  hoverable = false,
  animationDelay = 0,
}: SectionCardProps) {
  const delayClass = {
    0: "animate-fade-up",
    1: "animate-fade-up-delay-1",
    2: "animate-fade-up-delay-2",
    3: "animate-fade-up-delay-3",
  }[animationDelay];

  return (
    <Card
      className={clsx(
        "card-glow rounded-2xl border-border/70",
        hoverable && "transition-shadow duration-200",
        delayClass,
        className
      )}
    >
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
            {Icon && (
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent text-primary">
                <Icon size={15} strokeWidth={2.2} />
              </span>
            )}
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={clsx(!title && "pt-6")}>{children}</CardContent>
    </Card>
  );
}
