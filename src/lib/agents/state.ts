export interface TravelGraphState {
  userPreferences: {
    rawInput: string;
    mood: 'relax' | 'culture' | 'adventure' | 'flexible';
    budget: number;
    flexibility: number; // e.g. 0.15 for +15%
    departureAirport: string;
    durationDays: number;
    isBlindExploration: boolean;
    isRoadTrip: boolean;
  };
  discoveredDestinations: string[];
  rawQuotes: {
    id: string;
    destination: string;
    flightPrice: number;
    flightDetails: string;
    hotelPrice: number;
    hotelDetails: string;
    isAllInclusive: boolean;
    isDirectFlight: boolean;
    hotelStars: number;
    hotelRating: number; // out of 5
    experienceType: 'relax' | 'culture' | 'adventure';
    isSelfTransfer?: boolean; // Smart self-transfer flag
    transferHub?: string;     // e.g. "FCO", "MXP"
  }[];
  finalProposals: {
    cardType: 'target' | 'smart' | 'upgrade' | 'relax' | 'culture' | 'adventure';
    destination: string;
    title: string;
    flightDetails: string;
    hotelDetails: string;
    totalPrice: number;
    whyChooseIt: string;
  }[];
  logs: string[];
}

export function createInitialState(params: Partial<TravelGraphState['userPreferences']>): TravelGraphState {
  return {
    userPreferences: {
      rawInput: params.rawInput || "",
      mood: params.mood || "flexible",
      budget: params.budget || 500,
      flexibility: params.flexibility || 0.1,
      departureAirport: params.departureAirport || "MXP",
      durationDays: params.durationDays || 7,
      isBlindExploration: params.isBlindExploration || false,
      isRoadTrip: params.isRoadTrip || false,
    },
    discoveredDestinations: [],
    rawQuotes: [],
    finalProposals: [],
    logs: [],
  };
}
