import { AgencyState } from "../agencyState";

export async function marketingStrategistAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[C-Suite] Marketing Strategist: Elaboro la strategia per gli operativi..."];
  
  if (!state.financialStatus.approvedToSpend) {
    logs.push("[C-Suite] Marketing Strategist: Budget bloccato. Nessuna campagna questa settimana.");
    return { logs };
  }

  // Prende i trend dal Researcher. Se non bastano, aggiunge mete secondarie.
  const trending = state.marketTrends.trendingDestinations || [];
  const secondaryDestinations = ["Zanzibar", "Creta", "Albania", "Malta", "Lanzarote", "Sharm el-Sheikh"];
  
  const focusDestinations = [...new Set([...trending, ...secondaryDestinations])].slice(0, 5);
  
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
