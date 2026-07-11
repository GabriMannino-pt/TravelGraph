import { NextResponse } from "next/server";
import { initialAgencyState } from "@/lib/agents/agencyState";

import { cfoAgent } from "@/lib/agents/c-suite/cfo";
import { brandStrategistAgent } from "@/lib/agents/c-suite/brand_strategist";
import { marketResearcherAgent } from "@/lib/agents/c-suite/market_researcher";
import { performanceAnalystAgent } from "@/lib/agents/c-suite/performance_analyst";
import { marketingStrategistAgent } from "@/lib/agents/c-suite/marketing_strategist";

import { dealHunterAgent } from "@/lib/agents/execution/deal_hunter";
import { viralCopywriterAgent } from "@/lib/agents/execution/viral_copywriter";
import { visualArtistAgent } from "@/lib/agents/execution/visual_artist";
import { dispatcherAgent } from "@/lib/agents/execution/dispatcher";

export const dynamic = 'force-dynamic';

// Questo endpoint sarà chiamato quotidianamente da AWS EventBridge
export async function GET(request: Request) {
  // Sicurezza: Controlla che la richiesta provenga da AWS EventBridge
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.AWS_CRON_SECRET}`) {
    // Rimuovi commento in produzione per bloccare accessi non autorizzati
    // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let state = { ...initialAgencyState };

  // --- 🏛️ C-SUITE (STRATEGIA) ---
  state = { ...state, ...(await cfoAgent(state)) };
  if (!state.financialStatus.approvedToSpend) {
    return NextResponse.json({ status: "Fermato dal CFO", logs: state.logs });
  }

  state = { ...state, ...(await performanceAnalystAgent(state)) };
  state = { ...state, ...(await brandStrategistAgent(state)) };
  state = { ...state, ...(await marketResearcherAgent(state)) };
  state = { ...state, ...(await marketingStrategistAgent(state)) };

  // --- 🛠️ EXECUTION (OPERATIVITÀ) ---
  state = { ...state, ...(await dealHunterAgent(state)) };
  if (!state.dealFound) {
    return NextResponse.json({ status: "Nessun deal trovato oggi", logs: state.logs });
  }

  state = { ...state, ...(await viralCopywriterAgent(state)) };
  state = { ...state, ...(await visualArtistAgent(state)) };
  state = { ...state, ...(await dispatcherAgent(state)) };

  return NextResponse.json({
    status: "Success",
    campaign: {
      deal: state.dealFound,
      content: state.viralContent,
      visual: state.visualAssetUrl
    },
    logs: state.logs
  });
}
