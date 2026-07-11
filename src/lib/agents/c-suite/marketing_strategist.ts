import { AgencyState } from "../agencyState";

export async function marketingStrategistAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[C-Suite] Marketing Strategist: Elaboro la strategia per gli operativi..."];
  
  if (!state.financialStatus.approvedToSpend) {
    logs.push("[C-Suite] Marketing Strategist: Budget bloccato. Nessuna campagna questa settimana.");
    return { logs };
  }

  const trending = state.marketTrends.trendingDestinations || [];
  const secondaryDestinations = ["Zanzibar", "Creta", "Albania", "Malta", "Lanzarote", "Sharm el-Sheikh"];
  
  // Uniamo tutte le mete e le mescoliamo per far girare anche Malta, Creta ecc. prima di tagliarle a 5
  const allDestinations = [...new Set([...trending, ...secondaryDestinations])];
  const shuffledDestinations = allDestinations.sort(() => 0.5 - Math.random());
  const focusDestinations = shuffledDestinations.slice(0, 5);
  
  // Aeroporti principali italiani e sud Italia
  const focusOrigins = ["MXP", "FCO", "BGY", "VCE", "CTA", "PMO"];
  
  const targetDiscount = 40; // Percentuale minima di sconto richiesta (40%)
  const campaignType = "FOMO";

  logs.push(`[C-Suite] Marketing Strategist: Ordine Esecutivo! Broad Net su ${focusDestinations.join(", ")} da ${focusOrigins.join(", ")}. Sconto minimo richiesto: ${targetDiscount}%.`);

  return {
    weeklyStrategy: {
      ...state.weeklyStrategy,
      focusDestinations,
      focusOrigins,
      targetDiscount,
      campaignType
    },
    logs
  };
}
