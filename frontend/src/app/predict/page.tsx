"use client";

import { Badge } from "@/components/ui/badge";
import { Stethoscope } from "lucide-react";
import PredictForm from "@/components/PredictForm";

export default function PredictPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-14">
      {/* Page header */}
      <div className="mb-8 sm:mb-10 animate-fade-up">
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="secondary"
            className="rounded-full text-xs gap-1.5 px-3 py-1.5"
          >
            <Stethoscope size={11} />
            Clinical Input Form
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          CKD Risk Assessment
        </h1>
        <p className="mt-2 sm:mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
          Enter the patient&apos;s clinical values below. All 20 fields are required
          for the AI model to generate a reliable risk estimate. Values must be
          sourced from standardised laboratory tests.
        </p>
      </div>

      <PredictForm />
    </div>
  );
}
