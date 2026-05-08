"use client";

import {
  FlaskConical,
  Stethoscope,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SectionCard from "@/components/SectionCard";
import DisclaimerBox from "@/components/DisclaimerBox";

const clinicalFields = [
  { id: "age", label: "Age", unit: "years", type: "number", placeholder: "e.g. 52" },
  { id: "blood_pressure", label: "Blood Pressure", unit: "mm Hg", type: "number", placeholder: "e.g. 80" },
  { id: "specific_gravity", label: "Specific Gravity", unit: "", type: "number", placeholder: "e.g. 1.015" },
  { id: "albumin", label: "Albumin", unit: "g/dL", type: "number", placeholder: "e.g. 0–5" },
  { id: "serum_creatinine", label: "Serum Creatinine", unit: "mg/dL", type: "number", placeholder: "e.g. 1.2" },
  { id: "haemoglobin", label: "Haemoglobin", unit: "g/dL", type: "number", placeholder: "e.g. 14.5" },
  { id: "packed_cell_volume", label: "Packed Cell Volume", unit: "%", type: "number", placeholder: "e.g. 44" },
  { id: "blood_urea", label: "Blood Urea Nitrogen", unit: "mg/dL", type: "number", placeholder: "e.g. 18" },
];

const booleanFields = [
  { id: "hypertension", label: "Hypertension" },
  { id: "diabetes_mellitus", label: "Diabetes Mellitus" },
  { id: "coronary_artery_disease", label: "Coronary Artery Disease" },
  { id: "anemia", label: "Anemia" },
];

export default function PredictPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="rounded-full text-xs gap-1.5 px-3 py-1.5">
            <Stethoscope size={11} />
            Clinical Input Form
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          CKD Risk Assessment
        </h1>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
          Enter the patient&apos;s clinical laboratory values below. All fields are
          used by the AI model to generate a risk estimate. Ensure values are
          accurate and sourced from a clinical workup.
        </p>
      </div>

      <DisclaimerBox className="mb-8 animate-fade-up-delay-1" />

      {/* Form */}
      <form
        aria-label="CKD risk assessment form"
        className="space-y-6 animate-fade-up-delay-2"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Numeric Fields */}
        <SectionCard title="Laboratory Values" icon={FlaskConical}>
          <div className="grid gap-5 sm:grid-cols-2">
            {clinicalFields.map(({ id, label, unit, type, placeholder }) => (
              <div key={id} className="flex flex-col gap-1.5">
                <label
                  htmlFor={id}
                  className="text-sm font-medium text-foreground"
                >
                  {label}
                  {unit && (
                    <span className="ml-1 text-xs text-muted-foreground font-normal">
                      ({unit})
                    </span>
                  )}
                </label>
                <input
                  id={id}
                  name={id}
                  type={type}
                  placeholder={placeholder}
                  step="any"
                  min="0"
                  disabled
                  className="h-10 rounded-lg border border-input bg-muted/40 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60 transition"
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Boolean Fields */}
        <SectionCard title="Medical History" icon={ClipboardList} animationDelay={1}>
          <div className="grid gap-4 sm:grid-cols-2">
            {booleanFields.map(({ id, label }) => (
              <div key={id} className="flex items-center gap-3">
                <input
                  id={id}
                  name={id}
                  type="checkbox"
                  disabled
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring disabled:cursor-not-allowed"
                />
                <label htmlFor={id} className="text-sm text-foreground select-none">
                  {label}
                </label>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Backend not connected notice */}
        <SectionCard animationDelay={2}>
          <div className="flex gap-3 items-start">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Backend Not Yet Connected
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                The prediction form is a <strong>visual placeholder</strong>. Fields
                are disabled until the FastAPI ML backend is integrated. Submission
                will be enabled in a future release.
              </p>
            </div>
          </div>
        </SectionCard>

        <Separator />

        <button
          type="submit"
          disabled
          aria-disabled="true"
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm opacity-40 cursor-not-allowed transition"
        >
          Analyse Risk (Backend Pending)
        </button>
      </form>
    </div>
  );
}
