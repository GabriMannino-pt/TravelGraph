# ✈️ TravelGraph — Autonomous Multi-Agent Travel Orchestration & Marketing Agency

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Stateful multi-agent system combining real-time trip synthesis graph with an autonomous C-Suite & Execution marketing agency for algorithmic travel deals and content generation.**

---

## 🇮🇹 Executive Summary (Italiano)

**TravelGraph** è una piattaforma di orchestrazione viaggi e marketing turistico interamente basata su **architettura ad agenti autonomi cooperativi (Multi-Agent State Graph)**, sviluppata con **Next.js (App Router)** e **TypeScript**.

La piattaforma risolve due problemi strutturali del settore turistico:
1. **Pianificazione Viaggi Dinamica:** Un grafo a nodi sequenziali analizza in linguaggio naturale le preferenze dell'utente, risolve le coordinate geografiche, estrae le tariffe in tempo reale e genera itinerari ottimizzati giorno per giorno con link di prenotazione.
2. **Agenzia di Marketing Autonoma (Autonomous AI Agency):** Un comitato direttivo simulato (C-Suite Agents: CFO, Brand Strategist, Market Researcher) stabilisce ogni settimana le linee guida di spesa (ROI target), il tono di voce e le destinazioni in trend, delegando a una squadra operativa (Execution Agents: Deal Hunter, Viral Copywriter, Visual Artist) la ricerca di tariffe aeree scontate (\(\ge 40\%\)) e la generazione di copy e asset visuali per campagne virali.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph USER_ENGINE["1. Trip Synthesis State Graph"]
        direction TB
        REQ["User Natural Language Prompt"] --> ROUTER["Router & Parser Node<br/>(Extracts intent, budget, dates)"]
        ROUTER --> GEO["Geo Explorer Node<br/>(Resolves coordinates & city clusters)"]
        GEO --> DATA["Data Fetcher Node<br/>(Pulls live flight/hotel connections)"]
        DATA --> ITIN["Itinerary Architect Node<br/>(Builds day-by-day scheduling)"]
        ITIN --> BOOK["Booking Agent Node<br/>(Generates direct reservations & checkout)"]
    end

    subgraph C_SUITE["2. Autonomous Agency: Strategic C-Suite"]
        direction TB
        CFO["CFO Agent<br/>(Budget allocation, target ROI)"]
        BRAND["Brand Strategist Agent<br/>(Tone of voice, forbidden words)"]
        RESEARCH["Market Researcher Agent<br/>(Trending destinations & audio hooks)"]
        CFO & BRAND & RESEARCH --> STRAT["Weekly Strategic Direction & Baseline"]
    end

    subgraph EXECUTION["3. Autonomous Agency: Operational Execution"]
        direction TB
        DISPATCH["Agency Dispatcher"]
        HUNTER["Deal Hunter Agent<br/>(Scans flights for ≥40% discount)"]
        COPY["Viral Copywriter Agent<br/>(Hooks, captions, voiceover scripts)"]
        ARTIST["Visual Artist Agent<br/>(Dynamic banners & asset generation)"]
        STRAT --> DISPATCH
        DISPATCH --> HUNTER --> COPY --> ARTIST
    end

    subgraph PERSISTENCE["4. App & Persistence Layer"]
        NEXT["Next.js App Router UI<br/>(Server Components & Interactive Client)"]
        STORE[("Firebase Firestore & Storage<br/>(Newsletters, Agency Logs, Deals)")]
        USER_ENGINE --> NEXT
        ARTIST --> STORE
        NEXT <--> STORE
    end
```

---

## ⚡ Technical Highlights

1. **Stateful Graph Orchestration (`src/lib/agents/graph.ts`):**
   - Implements predictable state transitions where each node receives a typed `TravelGraphState`, executes async tools, appends structured logs, and returns partial state deltas.
2. **Role-Separated Agentic Architecture:**
   - Strict separation between executive governance (`c-suite/`) and tactical execution (`execution/`), preventing hallucinations and maintaining strategic budget control.
3. **Full-Stack Next.js 15 Integration:**
   - API route handlers for cron-triggered agency execution, webhooks, and modern glassmorphic UI styled with Tailwind CSS.

---

## 🚀 Quickstart

### 1. Requirements
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Installation
```bash
git clone https://github.com/GabriMannino-pt/TravelGraph.git
cd TravelGraph
npm install
```

### 3. Environment Variables
Create a `.env.local` file with the required Firebase and API keys:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to interact with the multi-agent graph planner.

---

## 📁 Repository Structure

```
TravelGraph/
├── src/
│   ├── app/                     # Next.js App Router (pages, api, crons)
│   ├── lib/
│   │   ├── agents/              # Multi-Agent Core Engine
│   │   │   ├── c-suite/         # CFO, Brand Strategist, Market Researcher
│   │   │   ├── execution/       # Deal Hunter, Viral Copywriter, Visual Artist
│   │   │   ├── agencyState.ts   # C-Suite State Machine definition
│   │   │   ├── agents.ts        # Node definitions
│   │   │   ├── graph.ts         # User Trip Graph Orchestrator
│   │   │   └── state.ts         # User Trip State Machine definition
│   │   ├── firebase.ts          # Firebase backend client
│   │   ├── newsletter.ts        # Automated deal distribution
│   │   └── share.ts             # Social sharing hooks
├── public/                      # Static assets & icons
└── README.md                    # Enterprise architectural documentation
```

---

## 👨‍💻 Author
**Gabriele Mannino**  
- Software Engineer & Automation Architect  
- LinkedIn: [linkedin.com/in/gabriele-mannino-dev](https://linkedin.com/in/gabriele-mannino-dev)  
- GitHub: [@GabriMannino-pt](https://github.com/GabriMannino-pt)  
- Email: `gabri.mannino.lavoro@gmail.com`
