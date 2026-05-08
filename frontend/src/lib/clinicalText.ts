import type { CKDPredictionInput } from "@/types/prediction";

// ─── Label Maps ─────────────────────────────────────────────────────────────

/**
 * Maps each categorical value to its full clinical phrase.
 * Mirrors the serialisation format used by the FastAPI backend.
 */
const YES_NO_LABEL: Record<string, string> = {
  yes: "yes",
  no: "no",
};

const APPET_LABEL: Record<string, string> = {
  good: "good",
  poor: "poor",
};

// ─── Internal Sentence Builders ──────────────────────────────────────────────

/**
 * Renders a numeric value with a unit, falling back gracefully
 * if the value is undefined or NaN.
 */
function numStr(value: number | undefined, unit = ""): string {
  if (value === undefined || Number.isNaN(value)) return "unknown";
  return unit ? `${value} ${unit}` : String(value);
}

/**
 * Capitalises the first character of a string.
 */
function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Core Function ───────────────────────────────────────────────────────────

/**
 * Converts a `CKDPredictionInput` object into a structured clinical
 * summary string that mirrors the backend's text-prompt format.
 *
 * The output is fed directly into the DistilBERT tokeniser on the
 * FastAPI side, so the sentence structure here must remain consistent
 * with `ml-api/app/utils/preprocess.py`.
 *
 * @param input - Validated CKD prediction input
 * @returns A single multi-sentence clinical summary string
 *
 * @example
 * buildClinicalText({
 *   age: 48, bp: 80, sg: 1.015, al: 1, su: 0,
 *   bgr: 148, bu: 36, sc: 1.2, sod: 137, pot: 4.5,
 *   hemo: 14.5, pcv: 44, wc: 7800, rc: 5.2,
 *   htn: "no", dm: "no", cad: "no", appet: "good",
 *   pe: "no", ane: "no",
 * });
 * // →
 * // "Patient is 48 years old. Blood pressure is 80 mmHg. Specific gravity
 * //  is 1.015. Albumin is 1. Sugar is 0. Blood glucose random is 148 mg/dL.
 * //  Blood urea is 36 mg/dL. Serum creatinine is 1.2 mg/dL. Sodium is 137
 * //  mEq/L. Potassium is 4.5 mEq/L. Haemoglobin is 14.5 g/dL. Packed cell
 * //  volume is 44%. White blood cell count is 7800 cells/cumm. Red blood
 * //  cell count is 5.2 millions/cmm. Hypertension is no. Diabetes mellitus
 * //  is no. Coronary artery disease is no. Appetite is good. Pedal oedema
 * //  is no. Anaemia is no."
 */
export function buildClinicalText(input: CKDPredictionInput): string {
  const sentences: string[] = [
    `Patient is ${numStr(input.age)} years old.`,
    `Blood pressure is ${numStr(input.bp)} mmHg.`,
    `Specific gravity is ${numStr(input.sg)}.`,
    `Albumin is ${numStr(input.al)}.`,
    `Sugar is ${numStr(input.su)}.`,
    `Blood glucose random is ${numStr(input.bgr)} mg/dL.`,
    `Blood urea is ${numStr(input.bu)} mg/dL.`,
    `Serum creatinine is ${numStr(input.sc)} mg/dL.`,
    `Sodium is ${numStr(input.sod)} mEq/L.`,
    `Potassium is ${numStr(input.pot)} mEq/L.`,
    `Haemoglobin is ${numStr(input.hemo)} g/dL.`,
    `Packed cell volume is ${numStr(input.pcv)}%.`,
    `White blood cell count is ${numStr(input.wc)} cells/cumm.`,
    `Red blood cell count is ${numStr(input.rc)} millions/cmm.`,
    `Hypertension is ${YES_NO_LABEL[input.htn] ?? input.htn}.`,
    `Diabetes mellitus is ${YES_NO_LABEL[input.dm] ?? input.dm}.`,
    `Coronary artery disease is ${YES_NO_LABEL[input.cad] ?? input.cad}.`,
    `Appetite is ${APPET_LABEL[input.appet] ?? input.appet}.`,
    `Pedal oedema is ${YES_NO_LABEL[input.pe] ?? input.pe}.`,
    `Anaemia is ${YES_NO_LABEL[input.ane] ?? input.ane}.`,
  ];

  return sentences.join(" ");
}

// ─── Partial Preview Builder ─────────────────────────────────────────────────

/**
 * Builds a partial clinical summary from an incomplete form state.
 * Only includes fields that have been filled in.
 * Useful for showing a live preview as the user fills the form.
 *
 * @param partial - Partial CKD input (fields may be undefined)
 * @returns Array of completed clinical sentences, in dataset order
 *
 * @example
 * buildPartialClinicalText({ age: 52, sc: 3.8 });
 * // ["Patient is 52 years old.", "Serum creatinine is 3.8 mg/dL."]
 */
export function buildPartialClinicalText(
  partial: Partial<CKDPredictionInput>
): string[] {
  const lines: string[] = [];

  const p = partial;

  if (p.age !== undefined)  lines.push(`Patient is ${p.age} years old.`);
  if (p.bp !== undefined)   lines.push(`Blood pressure is ${p.bp} mmHg.`);
  if (p.sg !== undefined)   lines.push(`Specific gravity is ${p.sg}.`);
  if (p.al !== undefined)   lines.push(`Albumin is ${p.al}.`);
  if (p.su !== undefined)   lines.push(`Sugar is ${p.su}.`);
  if (p.bgr !== undefined)  lines.push(`Blood glucose random is ${p.bgr} mg/dL.`);
  if (p.bu !== undefined)   lines.push(`Blood urea is ${p.bu} mg/dL.`);
  if (p.sc !== undefined)   lines.push(`Serum creatinine is ${p.sc} mg/dL.`);
  if (p.sod !== undefined)  lines.push(`Sodium is ${p.sod} mEq/L.`);
  if (p.pot !== undefined)  lines.push(`Potassium is ${p.pot} mEq/L.`);
  if (p.hemo !== undefined) lines.push(`Haemoglobin is ${p.hemo} g/dL.`);
  if (p.pcv !== undefined)  lines.push(`Packed cell volume is ${p.pcv}%.`);
  if (p.wc !== undefined)   lines.push(`White blood cell count is ${p.wc} cells/cumm.`);
  if (p.rc !== undefined)   lines.push(`Red blood cell count is ${p.rc} millions/cmm.`);
  if (p.htn !== undefined)  lines.push(`Hypertension is ${p.htn}.`);
  if (p.dm !== undefined)   lines.push(`Diabetes mellitus is ${p.dm}.`);
  if (p.cad !== undefined)  lines.push(`Coronary artery disease is ${p.cad}.`);
  if (p.appet !== undefined)lines.push(`Appetite is ${p.appet}.`);
  if (p.pe !== undefined)   lines.push(`Pedal oedema is ${p.pe}.`);
  if (p.ane !== undefined)  lines.push(`Anaemia is ${p.ane}.`);

  return lines;
}

// ─── Highlighted Summary ─────────────────────────────────────────────────────

/**
 * Returns a short human-readable summary of the most clinically
 * significant values — used in result and review UI panels.
 *
 * @param input - Validated CKD prediction input
 * @returns Array of `{ label, value }` pairs for the key indicators
 */
export function buildClinicalHighlights(
  input: CKDPredictionInput
): { label: string; value: string }[] {
  return [
    { label: "Age", value: `${input.age} years` },
    { label: "Blood Pressure", value: `${input.bp} mmHg` },
    { label: "Serum Creatinine", value: `${input.sc} mg/dL` },
    { label: "Blood Urea", value: `${input.bu} mg/dL` },
    { label: "Haemoglobin", value: `${input.hemo} g/dL` },
    { label: "Sodium", value: `${input.sod} mEq/L` },
    { label: "Hypertension", value: cap(input.htn) },
    { label: "Diabetes Mellitus", value: cap(input.dm) },
    { label: "Anaemia", value: cap(input.ane) },
  ];
}
