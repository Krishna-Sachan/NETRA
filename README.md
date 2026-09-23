<div align="center">

# 👁️ NETRA
### AI-Powered Criminal Network Intelligence & Link Analysis System

**Developed by Team Complexity Crushers for KAYA Hackathon, AZMTH**

[![AZMTH](https://img.shields.io/badge/Hackathon-KAYA%20IIT%20BHU-orange.svg?style=for-the-badge)](https://iitbhu.ac.in)
[![Team](https://img.shields.io/badge/Team-Complexity%20Crushers-blue.svg?style=for-the-badge)](#team-complexity-crushers)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=for-the-badge)](LICENSE)
[![Netlify](https://img.shields.io/badge/Deployment-Vercel%20Ready-black.svg?style=for-the-badge&logo=vercel)](https://vercel.com)

<p align="center">
  <b>Transforming unstructured police dossiers, FIRs, CDRs, and financial logs into explainable, evidence-backed criminal network graphs.</b>
</p>

</div>

---

## ⚠️ The Problem & The Gap

### 🔴 The Problem
Criminal syndicates operate through complex, interconnected webs—spanning covert associates, hawala channels, burner communication lines, staging locations, and maritime/land transit routes. Law enforcement agencies collect massive volumes of data (**FIRs, Call Detail Records (CDRs), Bank Audits, Surveillance Logs**), but it remains **siloed, unstructured, and fragmented** across disparate police databases. Manual correlation is labor-intensive, slow, and prone to missing critical hidden links.

### 🟡 The Gap in Existing Systems
While national platforms like **CCTNS** and **ICJS** centralize case records:
* Existing link-analysis tools show **what** data exists, but fail to explain **why** a connection matters or **how confident** that link is.
* Black-box AI outputs lack verifiable evidence trails, making them inadmissible or unhelpful for formal court proceedings.
* Investigators struggle to instantly pinpoint **key syndicate influencers, cross-cluster bridge nodes, or hawala conduits** with a court-defensible audit trail.

---

## 💡 The NETRA Solution

**NETRA** (National Entity Tracking & Relationship Analysis) is an intelligent decision-support layer designed specifically for law enforcement and intelligence analysts:

- 🔍 **Automated Entity & Relationship Extraction**: Parses raw unstructured FIRs, CDR transcripts, and financial records using Gemini 3.8 Flash to extract 7 core entity types (**PERSON, PHONE, VEHICLE, LOCATION, ORGANIZATION, EVENT, TRANSACTION**).
- ⛓️ **Strict Evidence Grounding**: Every single extracted entity, alias, and relationship link is anchored to an **exact verbatim snippet** from the source document. No halluncinations, no black boxes.
- 🧮 **Network Topology & Graphology X-Ray**: Uses Louvain community detection and centrality metrics (Betweenness, Degree) to highlight top syndicate leaders, operational bridge entities, and isolated cells.
- 🧩 **Fuzzy Entity Resolution & Deduplication**: Detects duplicate suspect profiles and aliases using Jaro-Winkler string similarity and phonetic matching.
- 🛰️ **Grounded Investigator Copilot**: Natural-language AI inquiry assistant that answers investigative queries, traces shortest paths between suspects, and auto-filters timeline ranges based strictly on verified case facts.
- 📜 **Court-Defensible Intelligence Reports**: Generates formal executive case briefings with complete SHA-256 document hashing and immutable audit logging.

---

## 🛠️ System Architecture

```
                    ┌─────────────────────────────────────────┐
                    │            NETRA USER INTERFACE         │
                    │   (React 19 + Tailwind CSS + Lucide)   │
                    └────────────────────┬────────────────────┘
                                         │
                    ┌────────────────────▼────────────────────┐
                    │     CYTOSCAPE.JS INTERACTIVE CANVAS    │
                    │ (Dark Graph + Warm Cream Sidebars Theme)│
                    └────────────────────┬────────────────────┘
                                         │
                    ┌────────────────────▼────────────────────┐
                    │      NETRA API & REWRITE GATEWAY        │
                    │     (Vercel Serverless / Express)      │
                    └────────────────────┬────────────────────┘
                                         │
             ┌───────────────────────────┴───────────────────────────┐
             │                                                       │
┌────────────▼─────────────┐                           ┌─────────────▼────────────┐
│   GEMINI 3.8 FLASH AI    │                           │ DETERMINISTIC NLP & REGEX│
│ Entity & Link Extraction │                           │ Client-Side Extraction   │
│ Investigator Copilot     │                           │ Local Grounded Fallback  │
└──────────────────────────┘                           └──────────────────────────┘
```

---

## 🌟 Key Features

### 1. 📁 Multi-Format Case Document Ingestion
- Drag-and-drop support for **PDF, TXT, DOCX, CSV, JSON** dossiers and FIR text.
- Auto-detection of document metadata (Doc Type, Issuing Authority, Date).
- Instant 1-click test document presets (Maritime Interception FIRs, Hawala CDR Analysis).

### 2. 🕸️ Interactive Crime Network Canvas
- High-performance **Cytoscape.js** rendering.
- Visual node encoding by entity type (Person, Phone, Vehicle, Location, Org, Transaction).
- Dynamic temporal slider to scrub through network evolution by date.

### 3. 🔬 Graphology X-Ray & Anomaly Radar
- **Influencer Centrality**: Highlights primary syndicate coordinators.
- **Bridge Detection**: Identifies critical nodes connecting two distinct regional crime clusters.
- **Louvain Clustering**: Colors distinct operational cells automatically.
- **Anomaly Radar**: Detects burner phone patterns, high-frequency call spikes, and unverified transactions.

### 4. 🤖 Grounded Investigator Copilot
- Interactive side drawer with prompt chips (`Explain connections`, `Find bridge nodes`, `Filter date range`).
- Strictly grounded responses: If information is not in the case file, Copilot explicitly responds: *"Not found in this case's data."*

---

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Graph Visualization**: Cytoscape.js, Graphology (`graphology-communities-louvain`, `graphology-metrics`)
- **Backend / API**: Node.js, Express.js, Vercel Serverless Functions
- **AI Engine**: Google `@google/genai` (Gemini 3.8 Flash Model)
- **Integrity**: Web Crypto API (SHA-256 hashing for tamper-proof document auditing)

---

## ⚙️ Quick Start & Local Setup

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** or **bun**

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/PriyaanshPandey/NETRA.git
   cd NETRA
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

---

## 🌐 Deploy to Vercel (1-Step Deployment)

This repository is pre-configured with `vercel.json` and `api/index.ts` for instant Vercel deployment:

1. Push your repository to GitHub.
2. Import the project in [Vercel Dashboard](https://vercel.com/new).
3. Set Environment Variable:
   - `GEMINI_API_KEY` = `your_gemini_api_key`
4. Click **Deploy**!

---

## 👥 Team Complexity Crushers

Developed with ❤️ for **KAYA Hackathon at IIT BHU**:

- **Team Name**: Complexity Crushers
- **Event**: KAYA Hackathon, Indian Institute of Technology (BHU) Varanasi
- **Project**: NETRA (Criminal Network Intelligence System)

---

## ⚖️ Legal & Statutory Disclaimer

*NETRA is designed strictly as an **investigative decision-support system** for law enforcement agencies. NETRA does NOT determine legal guilt, assess criminal liability, or output arbitrary criminality scores. All intelligence leads, entity resolutions, and relationship links generated by NETRA must be independently verified by authorized law enforcement officers prior to statutory action under applicable laws.*
