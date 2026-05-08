import Link from "next/link";
import { Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-white print:hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-white">
                <Activity size={14} strokeWidth={2.5} />
              </span>
              <span className="font-semibold text-sm">CKD Risk Screener</span>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              AI-assisted Chronic Kidney Disease risk estimation from clinical
              inputs, powered by DistilBERT.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Navigation
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/predict" className="hover:text-primary transition-colors">
                  Risk Screener
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Disclaimer
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This tool is for educational and screening-support purposes only.
              It does not constitute medical advice or diagnosis. Always consult
              a qualified healthcare provider.
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        <p className="text-center text-xs text-muted-foreground">
          &copy; {currentYear} CKD AI Risk Screener. Educational use only.
        </p>
      </div>
    </footer>
  );
}
