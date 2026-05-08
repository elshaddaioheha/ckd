import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";

interface PrimaryButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg";
  showArrow?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
}

export default function PrimaryButton({
  href,
  onClick,
  children,
  className,
  size = "default",
  showArrow = false,
  type = "button",
  disabled = false,
  variant = "default",
}: PrimaryButtonProps) {
  const arrow = showArrow ? (
    <ArrowRight
      size={14}
      className="ml-1.5 transition-transform duration-200 group-hover:translate-x-0.5"
    />
  ) : null;

  if (href) {
    return (
      <Link
        href={href}
        aria-disabled={disabled}
        className={clsx(
          buttonVariants({ variant, size }),
          "group inline-flex items-center font-semibold",
          disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        {children}
        {arrow}
      </Link>
    );
  }

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size={size}
      className={clsx("group font-semibold", className)}
    >
      {children}
      {arrow}
    </Button>
  );
}
