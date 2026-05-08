"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";
import {
  User,
  FlaskConical,
  ClipboardList,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  FileText,
} from "lucide-react";
import { clsx } from "clsx";

import { CKDInputSchema } from "@/lib/validation";

// Zod v4: the *input* type has coercible fields (unknown for numbers),
// which is what react-hook-form holds before submission.
// The *output* type (CKDInputSchemaType) is what we get after successful parse.
type CKDFormValues = z.input<typeof CKDInputSchema>;
type CKDOutputValues = z.output<typeof CKDInputSchema>;
import { buildClinicalText } from "@/lib/clinicalText";
import { CKD_FIELD_MAP } from "@/types/prediction";
import type { CKDPredictionInput, CKDPredictionResult } from "@/types/prediction";
import DisclaimerBox from "@/components/DisclaimerBox";
import PredictionResultCard from "@/components/PredictionResultCard";
import { Separator } from "@/components/ui/separator";

// ─── Helper Text ─────────────────────────────────────────────────────────────

const HELPER_TEXT: Partial<Record<keyof CKDPredictionInput, string>> = {
  sc: "Key CKD indicator. Normal range: 0.6–1.2 mg/dL. Elevated values suggest reduced kidney filtration.",
  bu: "Measures kidney waste removal. Normal range: 7–25 mg/dL. Elevated values may indicate renal impairment.",
  sg: "Reflects kidney concentration ability. Normal range: 1.005–1.030. Very low values may indicate poor renal function.",
  pcv:
    "Haematocrit — the percentage of blood volume occupied by red blood cells. Normal: ~36–50%.",
};

// ─── Field Sections ───────────────────────────────────────────────────────────

type FieldSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  fields: (keyof CKDPredictionInput)[];
};

const FIELD_SECTIONS: FieldSection[] = [
  {
    id: "basic",
    title: "Basic Information",
    icon: User,
    description: "Patient demographics and vital signs.",
    fields: ["age", "bp"],
  },
  {
    id: "lab",
    title: "Laboratory Measurements",
    icon: FlaskConical,
    description:
      "Enter values from a clinical workup. Ensure all values are from standardised laboratory tests.",
    fields: ["sg", "al", "su", "bgr", "bu", "sc", "sod", "pot", "hemo", "pcv", "wc", "rc"],
  },
  {
    id: "history",
    title: "Medical History",
    icon: ClipboardList,
    description: "Confirmed diagnoses from the patient's medical record.",
    fields: ["htn", "dm", "cad"],
  },
  {
    id: "symptoms",
    title: "Symptoms and Clinical Signs",
    icon: Stethoscope,
    description: "Observable signs and patient-reported symptoms.",
    fields: ["appet", "pe", "ane"],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1.5 text-xs text-destructive mt-1.5">
      <AlertCircle size={11} className="shrink-0" />
      {message}
    </p>
  );
}

function HelperText({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{text}</p>
  );
}

// ─── Clinical Text Preview Card ───────────────────────────────────────────────

function ClinicalTextPreview({ text }: { text: string }) {
  return (
    <div className="animate-fade-up rounded-2xl border border-primary/20 bg-accent/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-primary/15 bg-accent/60">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-white shrink-0">
          <FileText size={14} />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Generated Clinical Summary
          </p>
          <p className="text-xs text-muted-foreground">
            This is the text prompt that will be sent to the DistilBERT model.
          </p>
        </div>
        <CheckCircle size={18} className="ml-auto text-primary shrink-0" />
      </div>
      {/* Content */}
      <div className="px-5 py-4">
        <p className="text-sm text-foreground leading-7 font-mono tracking-tight">
          {text}
        </p>
      </div>
    </div>
  );
}

// ─── Main Form Component ──────────────────────────────────────────────────────

export default function PredictForm() {
  const [clinicalText, setClinicalText] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<CKDPredictionResult | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<CKDFormValues, unknown, CKDOutputValues>({
    resolver: zodResolver(CKDInputSchema),
    mode: "onTouched",
  });

  async function onValid(data: CKDOutputValues) {
    setApiError(null);
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result: CKDPredictionResult = await response.json();
      setPredictionResult(result);
      setClinicalText(result.clinical_text);
      setSubmitCount((c) => c + 1);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to connect to the prediction server.");
      // Fallback: still show clinical text even if API fails
      setClinicalText(buildClinicalText(data as CKDPredictionInput));
    }
  }

  function handleReset() {
    setPredictionResult(null);
    setClinicalText(null);
    setApiError(null);
    setSubmitCount(0);
    // Ideally we would reset the form here, but keeping simple for now
  }

  const totalErrors = Object.keys(errors).length;

  return (
    <div className="space-y-8">
      {/* API Error alert */}
      {apiError && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-destructive" />
          <div className="text-sm text-destructive">
            <p className="font-bold">Connection Failed</p>
            <p className="mt-0.5">{apiError}. Please ensure the FastAPI backend is running at http://localhost:8000.</p>
          </div>
        </div>
      )}

      {/* Error summary */}
      {totalErrors > 0 && (
        <div
          role="alert"
          aria-live="polite"
          className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">
            <strong>{totalErrors} field{totalErrors !== 1 ? "s" : ""} need attention</strong> — review
            the highlighted fields below before submitting.
          </p>
        </div>
      )}

      <form
        id="ckd-predict-form"
        aria-label="CKD Risk Assessment Form"
        onSubmit={handleSubmit(onValid)}
        noValidate
        className={clsx("space-y-6", predictionResult && "print:hidden")}
      >
        {FIELD_SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          const sectionHasErrors = section.fields.some(
            (f) => !!errors[f as keyof typeof errors]
          );

          return (
            <div
              key={section.id}
              role="group"
              aria-labelledby={`section-title-${section.id}`}
              className={clsx(
                "rounded-2xl border bg-white overflow-hidden transition-all duration-200",
                sectionHasErrors
                  ? "border-destructive/40 shadow-sm shadow-destructive/5"
                  : "border-border/70 card-glow"
              )}
            >
              {/* Section header */}
              <div id={`section-title-${section.id}`} className="w-full">
                <div
                  className={clsx(
                    "flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b",
                    sectionHasErrors ? "border-destructive/20 bg-destructive/3" : "border-border/50 bg-muted/30"
                  )}
                >
                  <span
                    className={clsx(
                      "flex items-center justify-center w-8 h-8 rounded-lg text-white shrink-0",
                      sectionHasErrors ? "bg-destructive" : "bg-primary"
                    )}
                  >
                    <SectionIcon size={15} strokeWidth={2.2} />
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {section.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  {sectionHasErrors && (
                    <span className="ml-auto text-xs font-medium text-destructive bg-destructive/10 rounded-full px-2.5 py-1">
                      Errors
                    </span>
                  )}
                </div>
              </div>

              {/* Fields grid */}
              <div
                className={clsx(
                  "p-4 sm:p-5 grid gap-4 sm:gap-5",
                  section.fields.length === 2
                    ? "sm:grid-cols-2"
                    : section.fields.length <= 3
                    ? "sm:grid-cols-3"
                    : "sm:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {section.fields.map((fieldKey) => {
                  const meta = CKD_FIELD_MAP[fieldKey];
                  const error = errors[fieldKey as keyof typeof errors];
                  const helperText = HELPER_TEXT[fieldKey];
                  const hasError = !!error;

                  return (
                    <div key={fieldKey} className="flex flex-col gap-1">
                      {/* Label */}
                      <label
                        htmlFor={fieldKey}
                        className="text-sm font-medium text-foreground"
                      >
                        {meta.label}
                        {meta.unit && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            ({meta.unit})
                          </span>
                        )}
                      </label>

                      {/* Input or Select */}
                      {meta.control === "number" ? (
                        <input
                          id={fieldKey}
                          type="number"
                          step="any"
                          min={0}
                          placeholder={meta.placeholder}
                          aria-describedby={
                            hasError
                              ? `${fieldKey}-error`
                              : helperText
                              ? `${fieldKey}-help`
                              : undefined
                          }
                          aria-invalid={hasError}
                          {...register(fieldKey as keyof CKDFormValues, {
                            valueAsNumber: true,
                          })}
                          className={clsx(
                            "h-10 w-full rounded-lg border px-3 text-sm text-foreground placeholder:text-muted-foreground/50 bg-background",
                            "focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring",
                            "transition-all duration-150",
                            hasError
                              ? "border-destructive/60 bg-destructive/3 focus:ring-destructive/30"
                              : "border-input hover:border-muted-foreground/40"
                          )}
                        />
                      ) : (
                        <div className="relative">
                          <select
                            id={fieldKey}
                            aria-describedby={hasError ? `${fieldKey}-error` : undefined}
                            aria-invalid={hasError}
                            {...register(fieldKey as keyof CKDFormValues)}
                            defaultValue=""
                            className={clsx(
                              "h-10 w-full appearance-none rounded-lg border px-3 pr-9 text-sm bg-background",
                              "focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring",
                              "transition-all duration-150 cursor-pointer",
                              hasError
                                ? "border-destructive/60 bg-destructive/3 text-foreground focus:ring-destructive/30"
                                : "border-input text-foreground hover:border-muted-foreground/40"
                            )}
                          >
                            <option value="" disabled className="text-muted-foreground">
                              Select...
                            </option>
                            {meta.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                        </div>
                      )}

                      {/* Helper text */}
                      {helperText && !hasError && (
                        <HelperText text={helperText} />
                      )}

                      {/* Field error */}
                      <div id={`${fieldKey}-error`}>
                        <FieldError message={error?.message as string | undefined} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <Separator />

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            type="submit"
            form="ckd-predict-form"
            disabled={isSubmitting}
            className={clsx(
              "w-full sm:w-auto inline-flex items-center justify-center gap-2",
              "h-11 px-8 rounded-xl font-semibold text-sm text-white",
              "bg-primary hover:bg-primary/90 active:scale-[0.98]",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Validating…
              </>
            ) : (
              <>
                <CheckCircle size={15} />
                Generate Clinical Summary
              </>
            )}
          </button>

          {isSubmitSuccessful && clinicalText && (
            <p className="text-xs text-primary font-medium animate-fade-in">
              Validation passed — summary generated below.
            </p>
          )}
        </div>
      </form>

      {/* Results / Preview Section */}
      {(predictionResult || clinicalText) && (
        <div key={submitCount} className="pt-4">
          {predictionResult ? (
            <PredictionResultCard result={predictionResult} onReset={handleReset} />
          ) : clinicalText ? (
            <ClinicalTextPreview text={clinicalText} />
          ) : null}
        </div>
      )}

      {/* Disclaimer */}
      <DisclaimerBox />
    </div>
  );
}
