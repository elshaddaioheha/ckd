import type { Metadata } from "next";
import { Database, Brain, TriangleAlert, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SectionCard from "@/components/SectionCard";
import DisclaimerBox from "@/components/DisclaimerBox";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about the dataset, the DistilBERT model, system limitations, and the architecture behind the CKD AI Risk Screener.",
};

const limitations = [
  "This model was trained on a specific clinical dataset and may not generalise to all patient populations or geographic regions.",
  "AI predictions are probabilistic estimates, not definitive diagnoses. They must be interpreted by a qualified clinician.",
  "Input features must be accurate and sourced from standardised laboratory tests. Erroneous inputs will produce unreliable outputs.",
  "The model has not been validated in a prospective clinical trial. It is intended for research and screening support only.",
  "Missing values or atypical clinical presentations may degrade model performance.",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14 space-y-10">
      {/* Header */}
      <div className="animate-fade-up">
        <Badge variant="secondary" className="rounded-full text-xs gap-1.5 px-3 py-1.5 mb-3">
          <BookOpen size={11} />
          Technical Overview
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          About CKD AI Risk Screener
        </h1>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
          This page explains the dataset, AI model architecture, and important
          limitations of this screening tool.
        </p>
      </div>

      <DisclaimerBox className="animate-fade-up-delay-1" />

      {/* Dataset */}
      <SectionCard title="Dataset" icon={Database} animationDelay={0}>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            The model was trained on the{" "}
            <strong className="text-foreground">
              UCI Chronic Kidney Disease Dataset
            </strong>
            , a widely used benchmark dataset for CKD classification tasks. It
            contains 400 patient records with 24 clinical features each, collected
            from a hospital over a two-month period.
          </p>
          <p>
            Features include numeric laboratory values (serum creatinine, blood
            urea, albumin, haemoglobin, packed cell volume) and nominal clinical
            indicators (hypertension, diabetes mellitus, coronary artery disease,
            red blood cell abnormalities, and others).
          </p>
          <p>
            The target variable is binary: <strong className="text-foreground">CKD</strong> or{" "}
            <strong className="text-foreground">Not CKD</strong>. The dataset
            was preprocessed to handle missing values using median imputation for
            numeric features and mode imputation for categorical features.
          </p>
          <div className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3">
            <p className="text-xs font-medium text-foreground">Reference</p>
            <p className="text-xs mt-1">
              Soundarapandian, L., Durai Raj, V., &amp; Sivagnanam, U. (2015).{" "}
              <em>Chronic Kidney Disease Dataset</em>. UCI Machine Learning
              Repository.
            </p>
          </div>
        </div>
      </SectionCard>

      <Separator />

      {/* Model */}
      <SectionCard title="Model Architecture" icon={Brain} animationDelay={1}>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            The prediction engine uses a{" "}
            <strong className="text-foreground">fine-tuned DistilBERT</strong>{" "}
            model from Hugging Face Transformers. DistilBERT is a smaller, faster
            variant of BERT that retains ~97% of BERT&apos;s language understanding
            capability while being 40% lighter and 60% faster.
          </p>
          <p>
            For this task, numerical clinical features are serialised into a
            structured natural language prompt (e.g.,{" "}
            <em>
              &ldquo;Patient, age 52, serum creatinine 3.8 mg/dL, haemoglobin
              9.6 g/dL, hypertension: yes...&rdquo;
            </em>
            ). The tokenised prompt is passed through the DistilBERT encoder and a
            classification head outputs the predicted class with a confidence
            score.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 mt-4">
            {[
              { label: "Base Model", value: "distilbert-base-uncased" },
              { label: "Parameters", value: "66 million" },
              { label: "Task Type", value: "Binary Classification" },
              { label: "Framework", value: "Hugging Face Transformers" },
              { label: "Input Format", value: "Serialised clinical prompt" },
              { label: "Output", value: "CKD / Not CKD + confidence" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-muted/40 px-3 py-2.5"
              >
                <p className="text-xs font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <Separator />

      {/* Limitations */}
      <SectionCard
        title="Limitations and Intended Use"
        icon={TriangleAlert}
        animationDelay={2}
      >
        <ul className="space-y-3">
          {limitations.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-lg bg-accent/60 border border-primary/20 px-4 py-3 text-sm text-foreground font-medium">
          This tool is intended solely for educational use and preliminary
          screening support. It must not be used as a substitute for clinical
          evaluation.
        </div>
      </SectionCard>

      {/* System Architecture */}
      <SectionCard title="System Architecture" animationDelay={3}>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            The application is structured as a{" "}
            <strong className="text-foreground">decoupled monorepo</strong> with a
            Next.js TypeScript frontend and a Python FastAPI backend serving the
            DistilBERT model.
          </p>
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs space-y-1 text-foreground">
            <p>Browser (Next.js) → POST /predict → FastAPI (uvicorn)</p>
            <p className="text-muted-foreground pl-4">↳ Preprocess clinical features</p>
            <p className="text-muted-foreground pl-4">↳ Serialise to text prompt</p>
            <p className="text-muted-foreground pl-4">↳ DistilBERT inference</p>
            <p className="text-muted-foreground pl-4">↳ Return {`{ prediction, confidence, risk_level }`}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
