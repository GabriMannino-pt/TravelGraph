export interface AgencyState {
  // C-Suite Data
  financialStatus: {
    budgetRemaining: number;
    targetROI: number;
    approvedToSpend: boolean;
  };
  brandGuidelines: {
    toneOfVoice: string;
    targetAudience: string;
    forbiddenWords: string[];
  };
  marketTrends: {
    trendingDestinations: string[];
    viralAudioHooks: string[];
    historicalInsights?: string[];
    marketBaselines?: Record<string, number>;
  };
  weeklyStrategy: {
    focusDestinations: string[];
    focusOrigins: string[];
    targetDiscount: number; // Percentuale di sconto richiesta (es. 40 per 40%)
    campaignType: "FOMO" | "LUXURY" | "ADVENTURE";
  };

  // Execution Data
  dealFound?: {
    destination: string;
    origin: string;
    price: number;
    regularPrice: number;
    departureDate: string;
    returnDate: string;
    airline: string;
  };
  viralContent?: {
    hook: string;
    voiceover: string;
    caption: string;
    hashtags: string[];
  };
  visualAssetUrl?: string;

  // Logs
  logs: string[];
}

export const initialAgencyState: AgencyState = {
  financialStatus: { budgetRemaining: 100, targetROI: 3.0, approvedToSpend: true },
  brandGuidelines: { toneOfVoice: "Aggressivo e Urgente", targetAudience: "Giovani viaggiatori", forbiddenWords: ["forse", "costoso"] },
  marketTrends: { trendingDestinations: [], viralAudioHooks: [], marketBaselines: {} },
  weeklyStrategy: { focusDestinations: ["Ovunque"], focusOrigins: ["MXP"], targetDiscount: 40, campaignType: "FOMO" },
  logs: []
};
