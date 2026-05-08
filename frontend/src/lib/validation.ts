import { z } from "zod";
import type { CKDPredictionInput } from "@/types/prediction";

// ─── Zod v4 Compatibility Note ───────────────────────────────────────────────
// This project uses Zod v4. Key API differences from v3:
//   - z.coerce.number() params: { error: string } (not invalid_type_error)
//   - z.enum() params: { error: string } (not required_error / invalid_type_error)
//   - ZodError: use .issues[] instead of .errors[]

// ─── Reusable Refiners ───────────────────────────────────────────────────────

const positiveNumber = (label: string) =>
  z.coerce
    .number({ error: `${label} must be a valid number.` })
    .positive({ error: `${label} must be greater than 0.` });

const boundedNumber = (label: string, min: number, max: number) =>
  z.coerce
    .number({ error: `${label} must be a valid number.` })
    .min(min, { error: `${label} must be at least ${min}.` })
    .max(max, { error: `${label} must be at most ${max}.` });

const yesNo = (label: string) =>
  z.enum(["yes", "no"] as const, {
    error: `${label} must be "yes" or "no".`,
  });

// ─── Zod Schema ──────────────────────────────────────────────────────────────

/**
 * Full Zod v4 validation schema for the CKD prediction form.
 *
 * - Numeric fields use `z.coerce.number()` so HTML string inputs are
 *   automatically converted before validation.
 * - Categorical fields are strict enums.
 * - All fields are required because the model needs complete data for
 *   reliable inference.
 */
export const CKDInputSchema = z.object({
  // ── Demographic ────────────────────────────────────────────────────────────
  age: boundedNumber("Age", 1, 120),

  // ── Vital Signs ────────────────────────────────────────────────────────────
  bp: positiveNumber("Blood pressure"),

  // ── Urinalysis ─────────────────────────────────────────────────────────────
  sg: z.coerce
    .number({ error: "Specific gravity must be a valid number." })
    .positive({ error: "Specific gravity must be positive." }),

  al: boundedNumber("Albumin", 0, 5),
  su: boundedNumber("Sugar", 0, 5),

  // ── Blood Chemistry ────────────────────────────────────────────────────────
  bgr: positiveNumber("Blood glucose random"),
  bu: positiveNumber("Blood urea"),
  sc: positiveNumber("Serum creatinine"),
  sod: positiveNumber("Sodium"),
  pot: positiveNumber("Potassium"),

  // ── Haematology ────────────────────────────────────────────────────────────
  hemo: positiveNumber("Haemoglobin"),
  pcv: positiveNumber("Packed cell volume"),
  wc: positiveNumber("White blood cell count"),
  rc: positiveNumber("Red blood cell count"),

  // ── Medical History (categorical) ─────────────────────────────────────────
  htn: yesNo("Hypertension"),
  dm: yesNo("Diabetes mellitus"),
  cad: yesNo("Coronary artery disease"),

  appet: z.enum(["good", "poor"] as const, {
    error: 'Appetite must be "good" or "poor".',
  }),

  pe: yesNo("Pedal oedema"),
  ane: yesNo("Anaemia"),
}) satisfies z.ZodType<CKDPredictionInput>;

// ─── Derived Types ───────────────────────────────────────────────────────────

/** Inferred TypeScript type from the schema (matches CKDPredictionInput) */
export type CKDInputSchemaType = z.infer<typeof CKDInputSchema>;

/** Field-level error map */
export type CKDFormErrors = Partial<
  Record<keyof CKDPredictionInput, string[]>
>;

// ─── Validation Helpers ──────────────────────────────────────────────────────

/**
 * Validates raw form data against the CKD input schema.
 *
 * @returns `{ success: true, data }` on valid input,
 *          or `{ success: false, errors }` with field-level messages on failure.
 *
 * @example
 * const result = validateCKDInput(formValues);
 * if (result.success) {
 *   // result.data is typed as CKDPredictionInput
 * } else {
 *   // result.errors is CKDFormErrors
 * }
 */
export function validateCKDInput(
  raw: unknown
):
  | { success: true; data: CKDPredictionInput }
  | { success: false; errors: CKDFormErrors } {
  const result = CKDInputSchema.safeParse(raw);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Zod v4: use .issues instead of .errors
  const errors: CKDFormErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof CKDPredictionInput | undefined;
    if (!field) continue;

    if (!errors[field]) errors[field] = [];
    errors[field]!.push(issue.message);
  }

  return { success: false, errors };
}

/**
 * Validates a single field value in isolation.
 * Useful for real-time per-field feedback as the user types.
 *
 * @param field - The field key to validate
 * @param value - The raw value from the input element
 * @returns Array of error messages, or an empty array if valid
 *
 * @example
 * validateCKDField("sc", "3.8")   // []
 * validateCKDField("age", "-5")   // ["Age must be at least 1."]
 */
export function validateCKDField(
  field: keyof CKDPredictionInput,
  value: unknown
): string[] {
  const fieldSchema = CKDInputSchema.shape[field];
  const result = fieldSchema.safeParse(value);

  if (result.success) return [];

  // Zod v4: .issues
  return result.error.issues.map((i) => i.message);
}

/**
 * Returns `true` if all required CKD fields are present in the
 * partial form state — without running full Zod validation.
 * Cheap check to enable/disable the submit button.
 */
export function isCKDFormComplete(
  partial: Partial<CKDPredictionInput>
): partial is CKDPredictionInput {
  const required: Array<keyof CKDPredictionInput> = [
    "age", "bp", "sg", "al", "su", "bgr", "bu", "sc",
    "sod", "pot", "hemo", "pcv", "wc", "rc",
    "htn", "dm", "cad", "appet", "pe", "ane",
  ];

  return required.every((key) => partial[key] !== undefined);
}
