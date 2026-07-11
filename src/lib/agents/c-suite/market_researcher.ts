import { AgencyState } from "../agencyState";

export async function marketResearcherAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[C-Suite] Market Researcher: Analisi dei trend settimanali..."];
  
  // Simulazione API di scraping trend (es. TikTok API o Google Trends)
  const trendingDestinations = ["Ibiza", "Maldive", "Tenerife", "Albania"];
  const viralAudioHooks = ["Interstellar Epic", "Paris Else", "Makeba"];
  
  logs.push(`[C-Suite] Market Researcher: Trend attuali rilevati: ${trendingDestinations.join(", ")}`);

  // Dizionario dei prezzi medi storici/di mercato per il calcolo sconti
  const marketBaselines: Record<string, number> = {
    "Ibiza": 220,
    "Maldive": 900,
    "Tenerife": 300,
    "Albania": 150,
    "Zanzibar": 850,
    "Creta": 200,
    "Malta": 120,
    "Lanzarote": 280,
    "Sharm el-Sheikh": 350
  };

  return {
    marketTrends: {
      ...state.marketTrends,
      trendingDestinations,
      viralAudioHooks: ["Audio 1 (Trending su TikTok)"],
      marketBaselines
    },
    logs
  };
}
