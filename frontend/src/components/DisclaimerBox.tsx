import { TriangleAlert } from "lucide-react";
import { clsx } from "clsx";

interface DisclaimerBoxProps {
  className?: string;
  compact?: boolean;
}

export default function DisclaimerBox({ className, compact = false }: DisclaimerBoxProps) {
  return (
    <div
      role="note"
      aria-label="Medical disclaimer"
      className={clsx(
        "flex gap-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-900",
        compact ? "px-4 py-3" : "px-5 py-4",
        className
      )}
    >
      <TriangleAlert
        size={compact ? 16 : 18}
        className="mt-0.5 shrink-0 text-amber-500"
      />
      <div className={clsx("leading-relaxed", compact ? "text-xs" : "text-sm")}>
        <span className="font-semibold">Medical Disclaimer — </span>
        This tool is for <strong>educational and screening-support purposes only</strong>.
        It does not constitute medical advice, clinical diagnosis, or treatment
        recommendations. Always consult a qualified and licensed healthcare provider
        before making any health-related decisions.
        {!compact && (
          <span className="block mt-1.5 text-xs text-amber-800">
            Model trained on UCI CKD dataset (Apollo Hospitals, India). Results should be
            interpreted within local clinical context. Not validated for sickle cell nephropathy,
            herbal medicine nephrotoxicity, or endemic infections common in West Africa.
          </span>
        )}
      </div>
    </div>
  );
}
