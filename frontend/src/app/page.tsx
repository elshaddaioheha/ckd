import type { Metadata } from "next";
import { Activity, Brain, FlaskConical, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PrimaryButton from "@/components/PrimaryButton";
import SectionCard from "@/components/SectionCard";
import DisclaimerBox from "@/components/DisclaimerBox";

export const metadata: Metadata = {
  title: "CKD AI Risk Screener — Home",
  description:
    "Estimate your Chronic Kidney Disease risk using AI and clinical values. Educational tool powered by DistilBERT.",
};

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "A fine-tuned DistilBERT model trained on clinical CKD datasets analyses your input values and produces a structured risk assessment.",
    delay: 0 as const,
  },
  {
    icon: FlaskConical,
    title: "Clinical Input Variables",
    description:
      "Enter standard lab values — serum creatinine, haemoglobin, albumin, blood pressure, and more — to generate a risk estimate.",
    delay: 1 as const,
  },
  {
    icon: ShieldCheck,
    title: "Transparent & Explainable",
    description:
      "Results include confidence scores and contributing factors so clinicians and researchers can interpret the model's reasoning.",
    delay: 2 as const,
  },
];

const steps = [
  { step: "01", label: "Enter clinical values", detail: "Input standard lab markers from a patient workup." },
  { step: "02", label: "AI analyses the data", detail: "The DistilBERT model processes the inputs through its learned representations." },
  { step: "03", label: "Review the risk report", detail: "Receive a structured CKD risk level, confidence score, and key contributing factors." },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/60 via-background to-background">
        {/* Subtle grid pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
          <Badge
            variant="secondary"
            className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium animate-fade-in"
          >
            <Activity size={11} />
            AI-Assisted Clinical Screening Tool
          </Badge>

          <h1 className="animate-fade-up text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Predict{" "}
            <span className="text-shimmer">Chronic Kidney Disease</span>{" "}
            <br className="hidden sm:block" />
            Risk with AI
          </h1>

          <p className="animate-fade-up-delay-1 mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Enter standard clinical laboratory values and receive an AI-generated
            CKD risk estimate in seconds — powered by a fine-tuned DistilBERT
            model trained on real-world kidney disease datasets.
          </p>

          <div className="animate-fade-up-delay-2 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton href="/predict" size="lg" showArrow>
              Start Risk Assessment
            </PrimaryButton>
            <PrimaryButton href="/about" size="lg" variant="outline">
              Learn How It Works
            </PrimaryButton>
          </div>

          <div className="animate-fade-up-delay-3 mt-10 mx-auto max-w-2xl">
            <DisclaimerBox compact />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        aria-labelledby="features-heading"
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <div className="text-center mb-12">
          <h2
            id="features-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            How the Screener Works
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            A three-layer pipeline converts raw clinical values into an
            interpretable CKD risk score.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {features.map(({ icon, title, description, delay }) => (
            <SectionCard
              key={title}
              icon={icon}
              title={title}
              hoverable
              animationDelay={delay}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </SectionCard>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl px-6" />

      {/* ── How to use ── */}
      <section
        id="how-to-use"
        aria-labelledby="steps-heading"
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <div className="text-center mb-12">
          <h2
            id="steps-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Using the Screener in 3 Steps
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ step, label, detail }) => (
            <div
              key={step}
              className="relative flex gap-4 rounded-2xl border border-border/70 bg-white px-6 py-5 card-glow"
            >
              <span className="text-3xl font-black text-primary/20 leading-none select-none">
                {step}
              </span>
              <div>
                <p className="font-semibold text-sm text-foreground">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <PrimaryButton href="/predict" size="lg" showArrow>
            Begin Assessment
          </PrimaryButton>
        </div>
      </section>

      {/* ── Full Disclaimer ── */}
      <section className="bg-muted/40 border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <DisclaimerBox />
        </div>
      </section>
    </>
  );
}
