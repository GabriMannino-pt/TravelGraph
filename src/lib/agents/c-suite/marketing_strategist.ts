import { AgencyState } from "../agencyState";

export async function marketingStrategistAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[C-Suite] Marketing Strategist: Elaboro la strategia per gli operativi..."];
  
  if (!state.financialStatus.approvedToSpend) {
    logs.push("[C-Suite] Marketing Strategist: Budget bloccato. Nessuna campagna questa settimana.");
    return { logs };
  }

  // Prende i trend dal Researcher e decide il target
  const focusDestination = state.marketTrends.trendingDestinations[0] || "Ovunque";
  const focusBudget = 50; // Cerca voli sotto i 50 euro
  const campaignType = "FOMO";

  logs.push(`[C-Suite] Marketing Strategist: Ordine Esecutivo! Obiettivo: ${focusDestination} a meno di ${focusBudget}€. Tipo campagna: ${campaignType}.`);

  return {
    weeklyStrategy: {
      ...state.weeklyStrategy,
      focusDestination,
      focusBudget,
      campaignType
    },
    logs
  };
}
