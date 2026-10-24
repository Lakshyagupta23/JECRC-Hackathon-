# AI Evaluation & Benchmark QA Platform

An end-to-end evaluation pipeline and data hygiene workbench for benchmark validation, hybrid model grading (deterministic checks + semantic judges), failure taxonomy diagnostics, human adjudication, and training data export (SFT & DPO).

Developed for **JECRC Hackathon**.

---

## Overview

Modern LLM evaluation workflows are often fragmented across disparate notebooks and uncalibrated evaluators. This platform provides a unified, traceable pipeline that bridges raw dataset ingestion to verified training data exports:

1. **Dataset Quality**: Automated scanning for schema corruption, missing prompts, and duplicate entries.
2. **Hybrid Evaluation**: Strict precedence for deterministic validators (exact match, numerical tolerance, regex, JSON schema) before invoking semantic LLM judges.
3. **Failure Taxonomy**: Granular categorization of model failures (hallucination, syntax error, precision drift, format violation).
4. **Human Adjudication**: Immutable audit trail for reviewer overrides on disputed tasks.
5. **Training Data Preparation**: Automated generation of Supervised Fine-Tuning (SFT) and Direct Preference Optimization (DPO) preference pairs.

---

## Key Features

### 1. Ingestion & Automated QA Scanner
- Real-time ingestion supporting JSONL and CSV benchmark files.
- Automated duplicate detection via prompt hashing.
- Schema validation, missing required field detection, and Dataset Quality Score computation.

### 2. Task & Rubric Studio
- Multi-domain task management across:
  - **Math & Reasoning**: Numerical tolerance constraints.
  - **Python / Code Generation**: Syntax, execution logic, and algorithmic assertions.
  - **Biomedical & Scientific QA**: Factual rigor and reference verification.
  - **Structured JSON Extraction**: Strict schema conformance and field parsing.
- Configurable scoring rubrics with weighted criteria and critical failure rules.

### 3. Hybrid Evaluation Runner
- Side-by-side comparative evaluation between model checkpoints (Baseline vs Fine-Tuned).
- Deterministic checks take strict precedence over semantic LLM judges.
- Real-time progress monitoring, latency metrics, and weighted score calculation.

### 4. Failure Diagnostics & Root-Cause Taxonomy
- Per-criterion pass/fail breakdown.
- Categorization into execution errors, precision drift, format violations, and hallucinations.
- Core Invariant: Model failure on a verified benchmark task does not disqualify it from training eligibility; it serves as a primary candidate for fine-tuning.

### 5. Human Adjudication Queue
- Triage queue for edge cases, critical failures, and disputed judge scores.
- Mandatory reviewer audit logging with user ID, rationale, and timestamps.

### 6. Training Artifact Export Engine
- **SFT Export**: Standard JSONL conversational format (`{"messages": [...]}`).
- **DPO Export**: Chosen (verified reference) vs. Rejected (failed model output) pairs with judge critiques.
- **Provenance Manifest**: Cryptographic SHA-256 fingerprint, record count, and filter audit trail.

---

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom CSS Variables (Dark Editorial Theme)
- **Icons**: Lucide React
- **Build Tool**: Vite 6

---

## Getting Started

### Prerequisites
- Node.js (v18.0 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Lakshyagupta23/JECRC-Hackathon-.git
cd JECRC-Hackathon-

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Type check and build bundle
npm run build

# Preview build locally
npm run preview
```

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Header.tsx             # Navigation, status indicators, and role badge
│   │   ├── IngestionQA.tsx        # File dropzone & automated hygiene scanner
│   │   ├── TaskRubricStudio.tsx   # Rubric calibration & task inspector
│   │   ├── EvaluationRunner.tsx   # Side-by-side model comparison & execution
│   │   ├── FailureAnalysis.tsx    # Failure taxonomy & criterion analytics
│   │   ├── AdjudicationQueue.tsx  # Human reviewer overrides with audit trail
│   │   └── ExportView.tsx         # SFT/DPO export engine & SHA-256 manifest
│   ├── data/
│   │   └── benchmarkTasks.ts      # Curated benchmark dataset & planted defects
│   ├── services/
│   │   ├── datasetService.ts      # Ingestion parsing, duplicate detection, schema QA
│   │   ├── evaluationEngine.ts    # Hybrid deterministic & judge scoring engine
│   │   ├── failureAnalysis.ts     # Taxonomy classification & domain metrics
│   │   └── exportService.ts       # SFT/DPO dataset and manifest generators
│   ├── types/
│   │   └── canonical.ts           # Canonical data contracts and schemas
│   ├── App.tsx                    # Root application state & navigation router
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global tokens, typography, and dark theme
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## License

MIT License.
