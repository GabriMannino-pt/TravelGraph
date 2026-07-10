import { AgencyState } from "../agencyState";

export async function cfoAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[C-Suite] CFO: Analizzo budget API e conversioni..."];
  
  // Logica fittizia/reale: Se abbiamo poco budget, ferma le campagne non profittevoli
  let approvedToSpend = true;
  if (state.financialStatus.budgetRemaining <= 0) {
    approvedToSpend = false;
    logs.push("[C-Suite] CFO: 🔴 ALLARME! Budget esaurito. Fermo tutte le operazioni a pagamento.");
  } else {
    logs.push("[C-Suite] CFO: 🟢 Budget ok. Operazioni autorizzate con target ROI: " + state.financialStatus.targetROI);
  }

  return {
    financialStatus: {
      ...state.financialStatus,
      approvedToSpend
    },
    logs
  };
}
