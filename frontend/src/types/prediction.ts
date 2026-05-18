// ─── Binary / Categorical Field Types ───────────────────────────────────────

/** Fields that accept "yes" | "no" responses */
export type YesNo = "yes" | "no";

/** Appetite field values */
export type AppetiteValue = "good" | "poor";

// ─── Prediction Input ────────────────────────────────────────────────────────

/**
 * Raw clinical input values for the CKD prediction model.
 * Field names match the UCI CKD dataset column abbreviations.
 *
 * Numeric fields are typed as `number`, categorical fields as their
 * respective union types. All fields are required for model inference.
 */
export interface CKDPredictionInput {
  /** Age of patient in years (1–120) */
  age: number;

  /** Blood pressure in mm Hg */
  bp: number;

  /** Specific gravity of urine (e.g. 1.005–1.025) */
  sg: number;

  /** Albumin level (0–5 scale) */
  al: number;

  /** Sugar level (0–5 scale) */
  su: number;

  /** Blood glucose random (mg/dL) */
  bgr: number;

  /** Blood urea (mg/dL) */
  bu: number;

  /** Serum creatinine (mg/dL) */
  sc: number;

  /** Sodium (mEq/L) */
  sod: number;

  /** Potassium (mEq/L) */
  pot: number;

  /** Haemoglobin (g/dL) */
  hemo: number;

  /** Packed cell volume (%) */
  pcv: number;

  /** White blood cell count (cells/cumm) */
  wc: number;

  /** Red blood cell count (millions/cmm) */
  rc: number;

  /** Hypertension */
  htn: YesNo;

  /** Diabetes mellitus */
  dm: YesNo;

  /** Coronary artery disease */
  cad: YesNo;

  /** Appetite */
  appet: AppetiteValue;

  /** Pedal oedema */
  pe: YesNo;

  /** Anaemia */
  ane: YesNo;
}

/**
 * Partial form state — all fields optional during progressive form entry.
 * Used for controlled form state before validation.
 */
export type CKDFormState = Partial<CKDPredictionInput>;

// ─── Prediction Output ───────────────────────────────────────────────────────

/** Risk level returned by the model */
export type RiskLevel = "Low" | "Moderate" | "High";

/** Prediction result returned by the FastAPI ML backend */
export interface CKDPredictionResult {
  /** Binary class prediction: 'ckd' or 'not_ckd' */
  prediction: "ckd" | "not_ckd";

  /** Model confidence / risk probability (0–1) */
  risk_probability: number;

  /** Derived risk level label */
  risk_level: RiskLevel;

  /** The generated clinical summary used for prediction */
  clinical_text: string;

  /** Clinically flagged abnormal findings that explain the result */
  key_findings: string[];

  /** Narrative reasoning connecting findings to the prediction */
  reasoning: string;

  /** Medical disclaimer from the backend */
  disclaimer: string;
}

// ─── Field Metadata ──────────────────────────────────────────────────────────

/** Type of UI control to render for a field */
export type FieldControlType = "number" | "select";

/** Metadata describing how a CKD input field should be rendered */
export interface CKDFieldMeta {
  /** Short API field key (matches CKDPredictionInput keys) */
  key: keyof CKDPredictionInput;

  /** Human-readable label for display in the UI */
  label: string;

  /** Unit string shown alongside the input (e.g. "mm Hg") */
  unit?: string;

  /** Input control type */
  control: FieldControlType;

  /** Placeholder text for number inputs */
  placeholder?: string;

  /** Select options for categorical fields */
  options?: { value: string; label: string }[];

  /** Optional clinical description for tooltips/help text */
  description?: string;
}

// ─── Field Registry ──────────────────────────────────────────────────────────

/** Full ordered list of CKD form field metadata */
export const CKD_FIELD_META: CKDFieldMeta[] = [
  {
    key: "age",
    label: "Age",
    unit: "years",
    control: "number",
    placeholder: "e.g. 52",
    description: "Patient age in years.",
  },
  {
    key: "bp",
    label: "Blood Pressure",
    unit: "mm Hg",
    control: "number",
    placeholder: "e.g. 80",
    description: "Diastolic blood pressure in millimetres of mercury.",
  },
  {
    key: "sg",
    label: "Specific Gravity",
    unit: "",
    control: "number",
    placeholder: "e.g. 1.015",
    description: "Urine specific gravity (typically 1.005–1.030).",
  },
  {
    key: "al",
    label: "Albumin",
    unit: "0–5 scale",
    control: "number",
    placeholder: "0–5",
    description: "Albumin level on a 0–5 ordinal scale.",
  },
  {
    key: "su",
    label: "Sugar",
    unit: "0–5 scale",
    control: "number",
    placeholder: "0–5",
    description: "Sugar level on a 0–5 ordinal scale.",
  },
  {
    key: "bgr",
    label: "Blood Glucose Random",
    unit: "mg/dL",
    control: "number",
    placeholder: "e.g. 148",
    description: "Random blood glucose level.",
  },
  {
    key: "bu",
    label: "Blood Urea",
    unit: "mg/dL",
    control: "number",
    placeholder: "e.g. 36",
    description: "Blood urea nitrogen level.",
  },
  {
    key: "sc",
    label: "Serum Creatinine",
    unit: "mg/dL",
    control: "number",
    placeholder: "e.g. 1.2",
    description: "Serum creatinine — key CKD indicator.",
  },
  {
    key: "sod",
    label: "Sodium",
    unit: "mEq/L",
    control: "number",
    placeholder: "e.g. 137",
    description: "Serum sodium level.",
  },
  {
    key: "pot",
    label: "Potassium",
    unit: "mEq/L",
    control: "number",
    placeholder: "e.g. 4.5",
    description: "Serum potassium level.",
  },
  {
    key: "hemo",
    label: "Haemoglobin",
    unit: "g/dL",
    control: "number",
    placeholder: "e.g. 14.5",
    description: "Haemoglobin concentration.",
  },
  {
    key: "pcv",
    label: "Packed Cell Volume",
    unit: "%",
    control: "number",
    placeholder: "e.g. 44",
    description: "Haematocrit / packed cell volume percentage.",
  },
  {
    key: "wc",
    label: "White Blood Cell Count",
    unit: "cells/cumm",
    control: "number",
    placeholder: "e.g. 7800",
    description: "WBC count in cells per cubic millimetre.",
  },
  {
    key: "rc",
    label: "Red Blood Cell Count",
    unit: "millions/cmm",
    control: "number",
    placeholder: "e.g. 5.2",
    description: "RBC count in millions per cubic centimetre.",
  },
  {
    key: "htn",
    label: "Hypertension",
    control: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    description: "Presence of hypertension.",
  },
  {
    key: "dm",
    label: "Diabetes Mellitus",
    control: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    description: "Presence of diabetes mellitus.",
  },
  {
    key: "cad",
    label: "Coronary Artery Disease",
    control: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    description: "Presence of coronary artery disease.",
  },
  {
    key: "appet",
    label: "Appetite",
    control: "select",
    options: [
      { value: "good", label: "Good" },
      { value: "poor", label: "Poor" },
    ],
    description: "Patient's appetite status.",
  },
  {
    key: "pe",
    label: "Pedal Oedema",
    control: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    description: "Presence of pedal (ankle/foot) oedema.",
  },
  {
    key: "ane",
    label: "Anaemia",
    control: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    description: "Presence of anaemia.",
  },
];

/** Lookup map from field key to its metadata — O(1) access */
export const CKD_FIELD_MAP = Object.fromEntries(
  CKD_FIELD_META.map((f) => [f.key, f])
) as Record<keyof CKDPredictionInput, CKDFieldMeta>;
