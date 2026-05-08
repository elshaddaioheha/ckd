# 🖥️ CKD AI Risk Screener — Frontend

This is the **Next.js (TypeScript)** web application for the CKD AI Risk Screener.

---

## ⚠️ Medical Disclaimer

This tool is for **educational purposes only** and does not constitute medical advice. Consult a licensed physician before making any health decisions.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios / Fetch API
- **State Management**: React Context / Zustand (TBD)

---

## Folder Structure (Planned)

```
frontend/
├── app/                  # Next.js App Router pages & layouts
│   ├── layout.tsx
│   ├── page.tsx          # Landing / home page
│   └── results/
│       └── page.tsx      # Risk result display page
├── components/           # Reusable UI components
├── lib/                  # API client, utilities
├── public/               # Static assets
├── styles/               # Global CSS
├── .env.local.example    # Environment variable template
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

| Variable              | Description                          |
|-----------------------|--------------------------------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI ML backend   |

---

## Available Scripts

| Command         | Description                  |
|-----------------|------------------------------|
| `npm run dev`   | Start local dev server       |
| `npm run build` | Build for production         |
| `npm run lint`  | Run ESLint                   |
| `npm run test`  | Run unit tests (Jest/Vitest) |

---

> **Status**: 🚧 Scaffold only — implementation pending.
