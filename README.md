<div align="center">

# 👁️ NETRA
### Network Intelligence for Traceable Relationship Analysis

**Evidence-grounded investigative network intelligence for fragmented case records.**

**Developed by Team Complexity Crushers for the KAYA Hackathon, AZMTH**

[![Hackathon](https://img.shields.io/badge/Hackathon-KAYA%20IIT%20BHU-orange.svg?style=for-the-badge)](https://iitbhu.ac.in)
[![Team](https://img.shields.io/badge/Team-Complexity%20Crushers-blue.svg?style=for-the-badge)](#team-complexity-crushers)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/AI-Gemini-4285F4.svg?style=for-the-badge&logo=google)](https://ai.google.dev/)

</div>

---

## 📌 Project Overview

NETRA is an **investigative decision-support prototype** that converts fragmented case documents into an interactive, explainable relationship network.

The system combines:

- **Generative AI** for unstructured document understanding, entity/relationship extraction, grounded explanations, and the Investigator Copilot.
- **Deterministic graph and statistical algorithms** for network metrics, community detection, shortest supported paths, timelines, and anomaly analysis.
- **Evidence provenance** so extracted entities and relationships can be traced to source text.
- **Investigator-in-the-loop controls** for entity resolution, masking, audit events, and evidence review.

> **Core principle:** NETRA assists investigation; it does not determine guilt, criminal liability, or a person's legal status.

---

## 🎯 Problem

Investigative records can be distributed across FIRs, communication records, surveillance notes, financial records, and other documents. Important relationships can be difficult to discover when the information is read document-by-document.

NETRA provides a single investigation workspace in which an investigator can move from:

**documents → entities → relationships → network structure → evidence-backed explanations**

The goal is not to replace existing case-management or criminal-justice systems, but to demonstrate an **explainable intelligence layer** on top of fragmented case evidence.

---

## 💡 What NETRA Does

### 1. 📄 Evidence Ingestion & AI Extraction
- Accepts case material such as text documents and supported document formats in the prototype.
- Extracts seven entity types:
  - `PERSON`
  - `PHONE`
  - `VEHICLE`
  - `LOCATION`
  - `ORGANIZATION`
  - `EVENT`
  - `TRANSACTION`
- Extracts semantic relationships between entities.
- Requires extracted claims to carry source evidence snippets.

### 2. 🕸️ Interactive Investigation Graph
- Cytoscape.js renders the case relationship network.
- Nodes are encoded by entity type.
- Relationships can be inspected and traced back to their source evidence.
- Multiple graph layouts and entity filters support investigation workflows.

### 3. 🔬 Network X-Ray
Deterministic graph analytics surface structural properties of the network, including:

- Degree-based importance
- Betweenness / bridge structure
- Community detection using Louvain clustering
- Influencer and isolated-node views

NETRA uses **Network Importance** to describe graph structure. It does **not** produce a criminality or guilt score.

### 4. 🧩 Entity Resolution
Possible duplicate identities can be surfaced using deterministic similarity checks.

The system deliberately keeps the investigator in control:

**Review Evidence → Merge** or **Keep Separate**

No identity is silently auto-merged.

### 5. 🚨 Anomaly Radar
Rule/statistical detectors can highlight patterns such as unusual communication concentration, repeated activity, or other case-defined anomalies.

Each detector is presented with its observations and supporting evidence rather than as an unexplained risk score.

### 6. 🔗 Explain This Connection
Given two entities, NETRA can calculate a shortest supported path through the case graph and show the evidence associated with the path's hops.

The result describes **network support**, not guilt or causation.

### 7. 🤖 Investigator Copilot
The Copilot provides natural-language investigation assistance grounded in the active case.

Example questions:

```text
Why is this entity important in the graph?
How are these two entities connected?
Show events involving this entity during a date range.
```

The Copilot is designed to stay within the case context and can return structured investigation actions such as graph or timeline filtering.

### 8. 🔐 Access, Integrity & Audit Features
The prototype also demonstrates:

- Role-aware field masking
- Restricted actions by role
- SHA-256 document integrity information
- Demo audit logging of significant investigator actions
- Case intelligence report generation

These features demonstrate the intended governance model; the current hackathon prototype is **not a production secure-RBAC or immutable-audit deployment**.

---

## 🏗️ Architecture

```text
                    ┌───────────────────────────────────┐
                    │         NETRA React UI             │
                    │ React + TypeScript + Tailwind     │
                    └─────────────────┬─────────────────┘
                                      │
                    ┌─────────────────▼─────────────────┐
                    │      Investigation Workspace       │
                    │ Case Files | Graph | Intelligence │
                    └─────────────────┬─────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              │                                               │
      ┌───────▼────────┐                            ┌─────────▼─────────┐
      │ Gemini AI       │                            │ Deterministic     │
      │                 │                            │ Intelligence       │
      │ • Extraction    │                            │ • Graph metrics    │
      │ • Insights      │                            │ • Louvain          │
      │ • Copilot       │                            │ • Shortest paths   │
      │ • Explanations  │                            │ • Timeline logic   │
      └───────┬────────┘                            │ • Anomaly rules    │
              │                                     │ • Entity matching  │
              └──────────────────┬──────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Evidence Validation &   │
                    │ Provenance Controls     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Investigator-facing     │
                    │ intelligence workspace  │
                    └─────────────────────────┘
```

### AI vs deterministic responsibilities

NETRA intentionally does **not** use an LLM to calculate graph metrics.

| Component | Responsibility |
|---|---|
| Gemini | Entity/relationship extraction, case-grounded insights, Copilot responses, explanation language |
| Graphology / deterministic algorithms | Degree, betweenness, communities, shortest paths and other graph calculations |
| Local validation | Evidence ownership, schema validation, provenance checks and safety constraints |
| React/Cytoscape | Investigator interface and interactive network visualization |

---

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Motion

### Graph & Analytics
- Cytoscape.js
- Graphology
- `graphology-communities-louvain`
- `graphology-metrics`

### Backend / API
- Node.js
- Express.js
- TypeScript
- Vercel-compatible API routing via `vercel.json` / `api/index.ts`

### AI
- Google Gemini via `@google/genai`
- Structured JSON extraction with schema validation

### Integrity & Governance
- Web Crypto API / SHA-256
- Role-aware access policy
- Demo audit logging
- Evidence provenance validation

---

## 📂 Repository Structure

```text
NETRA/
├── src/                   # React application, components, services and utilities
├── api/                   # Deployment API entry point
├── server.ts              # Express development/API server
├── test/                  # Automated validation and intelligence-layer tests
├── public/                # Static assets
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json            # API rewrites for Vercel deployment
├── .env.example           # Environment variable template
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites

- **Node.js 18+**
- **npm** (or Bun)
- A Gemini API key for AI-powered extraction and Copilot features

### 1. Clone the repository

```bash
git clone https://github.com/PriyaanshPandey/NETRA.git
cd NETRA
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env` in the project root:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
APP_URL="http://localhost:3000"
```

**Never commit `.env` or a real API key to GitHub.** Use `.env.example` as the public template.

### 4. Start the application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 5. Validate the build

```bash
npm run lint
npm test
npm run build
```

A successful build may report a large-bundle warning from Vite; that warning does not by itself indicate a failed build.

---

## 🌐 Vercel Deployment

The repository includes `vercel.json` and an API entry point intended for a Vercel deployment.

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add the following environment variable in the Vercel project settings:

```text
GEMINI_API_KEY=your_gemini_api_key
```

4. Deploy.
5. Verify the API health endpoint:

```text
https://<your-deployment>/api/health
```

The Copilot and AI extraction features require the deployed API route to be reachable and the Gemini environment variable to be configured.

> **Deployment note:** The repository is configured around Vercel's serverless API routing. A plain static hosting deployment must provide an equivalent `/api/*` backend route; otherwise the frontend can load while AI API calls fail.

---

## 🧪 Testing

The project contains automated checks for the core intelligence and safety layers, including:

- Evidence validation
- Graph intelligence calculations
- Anomaly logic
- Entity resolution / provenance behavior
- Explain-connection path logic
- Copilot grounding and validation
- Prompt-injection / untrusted-data handling
- Legal-conclusion safeguards
- Fallback behavior

Run the complete suite with:

```bash
npm test
```

---

## 🎬 Demo Workflow

The recommended hackathon demonstration follows one continuous investigation:

```text
Upload case evidence
        ↓
AI entity & relationship extraction
        ↓
Interactive network graph
        ↓
Network X-Ray
        ↓
Anomaly Radar
        ↓
Explain an indirect connection
        ↓
Entity Resolution review
        ↓
Investigator Copilot
        ↓
Role masking + Audit Log
        ↓
Evidence / integrity review
```

The demo should use **synthetic case data only**.

---

## 📦 Synthetic Demo Data

This repository is a hackathon prototype and should be demonstrated with synthetic or otherwise authorized test data.

For example, the accompanying **Operation Crosswind** demo case is designed to exercise:

- Multi-document ingestion
- Communication relationships
- Financial relationships
- Repeated-location activity
- Entity-resolution review
- Network bridges / centrality
- Timeline reasoning
- Explain Connection
- Copilot grounding

No real criminal records or personally sensitive investigative data should be committed to this public repository.

---

## 🔒 Security & Responsible Use

NETRA is designed as an **investigative decision-support prototype**.

The system does not:

- determine guilt or innocence;
- assign a criminality score;
- make legal conclusions;
- silently merge identities;
- treat model-generated claims as independent evidence.

Important safeguards include:

- source-evidence grounding;
- investigator-controlled entity resolution;
- deterministic graph calculations;
- validation of structured AI outputs;
- untrusted-data boundaries for case documents;
- role-aware masking and restricted actions in the prototype.

Before any operational deployment, additional controls would be required, including production authentication/authorization, durable database storage, secure secret management, immutable audit infrastructure, deployment hardening, monitoring, logging, retention controls, and formal legal/compliance review.

---

## 🚧 Current Prototype Scope

This repository represents the **hackathon prototype** rather than a complete production law-enforcement platform.

Current prototype characteristics include:

- in-memory case state during the application session;
- demonstration-oriented role switching and audit logging;
- Vercel-oriented API deployment configuration;
- synthetic demo data;
- Gemini dependency for AI-assisted features.

A production architecture would move case persistence, identity management, evidence storage, audit infrastructure, and access control into dedicated backend services and databases.

---

## 👥 Team Complexity Crushers

**Event:** KAYA Hackathon, Indian Institute of Technology (BHU), Varanasi  
**Project:** NETRA — Network Intelligence for Traceable Relationship Analysis

### Team Members

> **Add the official team-member names and roles here before publishing the final GitHub repository.**

| Member |
|---|---|
| Jai Jeet Sachan | Team Leader |
| Priyaansh Pandey |
| Krishna Sachan |
| Khushi Mishra |

---

## 📄 License

This project is released under the **Apache License 2.0**. See [LICENSE](LICENSE) for details.

---

## ⚖️ Disclaimer

NETRA is a hackathon research/prototype project intended to demonstrate explainable investigative intelligence workflows. All generated outputs require human review and independent verification. The prototype does not determine legal guilt, criminal liability, or the validity of any allegation.

---

<div align="center">

### NETRA
**From fragmented records to explainable, traceable intelligence.**

</div>
