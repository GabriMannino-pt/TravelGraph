import { TravelGraphState } from "./state";
import { db, isFirebaseConfigured } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// ==========================================
// LOCAL FALLBACK DATA & REPOS
// ==========================================

export const LOCAL_LOOK_ALIKES: Record<string, string> = {
  "creta": "Rodi",
  "ibiza": "Maiorca",
  "parigi": "Lione",
  "londra": "Manchester",
  "roma": "Napoli",
  "maldive": "Zanzibar"
};

export const LOCAL_FLIGHTS = [
  { departure: "MXP", destination: "Creta", price: 150, details: "Volo diretto EasyJet A/R", isDirect: true },
  { departure: "MXP", destination: "Rodi", price: 90, details: "Volo Ryanair diretto A/R", isDirect: true },
  { departure: "MXP", destination: "Ibiza", price: 180, details: "Volo Vueling A/R", isDirect: true },
  { departure: "MXP", destination: "Maiorca", price: 100, details: "Volo Ryanair diretto A/R", isDirect: true },
  { departure: "MXP", destination: "Parigi", price: 120, details: "Volo Air France A/R", isDirect: true },
  { departure: "MXP", destination: "Lione", price: 70, details: "Volo Ryanair A/R", isDirect: true },
  { departure: "MXP", destination: "Tenerife", price: 140, details: "Volo Wizz Air A/R", isDirect: true },
  { departure: "MXP", destination: "Reykjavik", price: 280, details: "Volo Icelandair diretto A/R", isDirect: true },
  { departure: "MXP", destination: "Roma", price: 60, details: "Volo Ryanair A/R", isDirect: true },
  { departure: "MXP", destination: "Napoli", price: 45, details: "Volo EasyJet A/R", isDirect: true },
  
  { departure: "FCO", destination: "Creta", price: 160, details: "Volo Aegean Airlines con scalo A/R", isDirect: false },
  { departure: "FCO", destination: "Rodi", price: 110, details: "Volo Ryanair diretto A/R", isDirect: true },
  { departure: "FCO", destination: "Ibiza", price: 195, details: "Volo Wizz Air A/R", isDirect: true },
  { departure: "FCO", destination: "Maiorca", price: 115, details: "Volo Ryanair diretto A/R", isDirect: true },
  { departure: "FCO", destination: "Parigi", price: 130, details: "Volo ITA Airways A/R", isDirect: true },
  { departure: "FCO", destination: "Lione", price: 80, details: "Volo Ryanair A/R", isDirect: true },
  { departure: "FCO", destination: "Tenerife", price: 155, details: "Volo Wizz Air A/R", isDirect: true },
  { departure: "FCO", destination: "Reykjavik", price: 300, details: "Volo Wizz Air A/R", isDirect: true },
  
  // Flights from Catania (CTA) to HUBS for smart self-transfer
  { departure: "CTA", destination: "FCO", price: 45, details: "Volo Ryanair A/R diretto", isDirect: true },
  { departure: "CTA", destination: "MXP", price: 55, details: "Volo EasyJet A/R diretto", isDirect: true },
];

export const LOCAL_HOTELS = [
  // Creta
  { destination: "Creta", name: "Creta Sun Beach Resort", price: 400, details: "7 notti, Camera Standard, Colazione inclusa", isAllInclusive: false, stars: 3, rating: 4.1, experienceType: "relax" },
  { destination: "Creta", name: "Creta Palace Luxury & Spa", price: 750, details: "7 notti, Deluxe All-Inclusive, Accesso Spa", isAllInclusive: true, stars: 5, rating: 4.8, experienceType: "relax" },
  
  // Rodi
  { destination: "Rodi", name: "Rhodes Smart Budget Hotel", price: 320, details: "7 notti, Camera Matrimoniale, Solo pernottamento", isAllInclusive: false, stars: 3, rating: 4.0, experienceType: "relax" },
  { destination: "Rodi", name: "Rhodes Horizon Beach Resort", price: 580, details: "7 notti, All-Inclusive Buffet, Piscina", isAllInclusive: true, stars: 4, rating: 4.5, experienceType: "relax" },
  
  // Ibiza
  { destination: "Ibiza", name: "Ibiza Town Center Hostal", price: 300, details: "7 notti, Camera Doppia, Vicino alle discoteche", isAllInclusive: false, stars: 2, rating: 3.9, experienceType: "adventure" },
  { destination: "Ibiza", name: "Ushuaïa Beach Club & Hotel", price: 950, details: "7 notti, Superior Room, Party Pass Incluso", isAllInclusive: false, stars: 5, rating: 4.7, experienceType: "adventure" },
  
  // Maiorca
  { destination: "Maiorca", name: "Mallorca Smart Cove Hotel", price: 290, details: "7 notti, Camera Vista Mare, Colazione", isAllInclusive: false, stars: 3, rating: 4.2, experienceType: "relax" },
  { destination: "Maiorca", name: "Mallorca Sol All-Inclusive", price: 540, details: "7 notti, All-Inclusive, Fronte Spiaggia", isAllInclusive: true, stars: 4, rating: 4.4, experienceType: "relax" },
  
  // Parigi
  { destination: "Parigi", name: "Hotel Les Deux Gares", price: 600, details: "5 notti, Camera Doppia, Vicino Metro", isAllInclusive: false, stars: 3, rating: 4.3, experienceType: "culture" },
  { destination: "Parigi", name: "Le Bristol Paris", price: 1200, details: "5 notti, Prestige Room, Trattamento VIP", isAllInclusive: false, stars: 5, rating: 4.9, experienceType: "culture" },

  // Lione
  { destination: "Lione", name: "Lyon Vieux Central Hotel", price: 350, details: "5 notti, Standard Double, Colazione tipica", isAllInclusive: false, stars: 3, rating: 4.2, experienceType: "culture" },
  { destination: "Lione", name: "Villa Florentine Relais", price: 750, details: "5 notti, Suite Vista Lione, Piscina riscaldata", isAllInclusive: false, stars: 5, rating: 4.8, experienceType: "culture" },

  // Tenerife
  { destination: "Tenerife", name: "Tenerife Wellness Oasis & Spa", price: 360, details: "7 notti, Camera Vista Oceano, Accesso Terme", isAllInclusive: false, stars: 4, rating: 4.6, experienceType: "relax" },
  { destination: "Tenerife", name: "Tenerife Sunset Resort All-Inclusive", price: 620, details: "7 notti, Pacchetto All-Inclusive, Mini-Club e Spa", isAllInclusive: true, stars: 5, rating: 4.7, experienceType: "relax" },

  // Reykjavik
  { destination: "Reykjavik", name: "Reykjavik Backpacker Base", price: 390, details: "7 notti, Camera Privata, Tour Aurora Boreale", isAllInclusive: false, stars: 3, rating: 4.3, experienceType: "adventure" },
  { destination: "Reykjavik", name: "Black Sand Adventure Lodge", price: 850, details: "7 notti, Cabin Indipendente, Escursione Ghiacciaio", isAllInclusive: false, stars: 4, rating: 4.8, experienceType: "adventure" },

  // Roma
  { destination: "Roma", name: "Rome Central Colosseum Inn", price: 420, details: "5 notti, Camera Doppia, Vista Foro Romano", isAllInclusive: false, stars: 3, rating: 4.1, experienceType: "culture" },
  { destination: "Roma", name: "Rome Waldorf Astoria", price: 1100, details: "5 notti, Suite Imperiale, Terrazza Panoramica", isAllInclusive: false, stars: 5, rating: 4.9, experienceType: "culture" },

  // Napoli
  { destination: "Napoli", name: "Spaccanapoli Bed & Breakfast", price: 210, details: "5 notti, Camera Matrimoniale, Sfogliatella Inclusa", isAllInclusive: false, stars: 3, rating: 4.4, experienceType: "culture" },
  { destination: "Napoli", name: "Grand Hotel Vesuvio", price: 720, details: "5 notti, Camera Superior Vista Vesuvio, 5 Stelle", isAllInclusive: false, stars: 5, rating: 4.8, experienceType: "culture" },

  // Road Trip local destinations (Sicilia - Vicino Catania)
  { destination: "Taormina", name: "Taormina Villa Diodoro", price: 460, details: "7 notti, Camera Doppia Vista Etna, Colazione", isAllInclusive: false, stars: 4, rating: 4.6, experienceType: "relax" },
  { destination: "Taormina", name: "Belmond Grand Hotel Timeo", price: 980, details: "7 notti, Vista Teatro Greco, Servizio Limousine", isAllInclusive: false, stars: 5, rating: 4.9, experienceType: "relax" },

  // Siracusa
  { destination: "Siracusa", name: "Ortigia Royal Suite", price: 340, details: "7 notti, Camera Matrimoniale in Centro Storico", isAllInclusive: false, stars: 3, rating: 4.3, experienceType: "culture" },
  { destination: "Siracusa", name: "Grand Hotel Minareto", price: 790, details: "7 notti, Suite Vista Mare con Accesso Spiaggia Privata", isAllInclusive: false, stars: 5, rating: 4.7, experienceType: "relax" },

  // Avola
  { destination: "Avola", name: "Avola Residence Marina", price: 280, details: "7 notti, Appartamento Bilocale a 50m dal Mare", isAllInclusive: false, stars: 3, rating: 4.1, experienceType: "relax" },
  { destination: "Avola", name: "Nero d'Avola Wine Resort", price: 520, details: "7 notti, All-Inclusive Degustazioni, Suite Piscina", isAllInclusive: true, stars: 4, rating: 4.5, experienceType: "adventure" },
];

// Helper to scale flights for any departure airport dynamically
function getFlightsForAirport(airport: string, destination: string) {
  const normalizedAirport = airport.toUpperCase().trim();
  const normalizedDest = destination.toLowerCase().trim();
  
  const matches = LOCAL_FLIGHTS.filter(
    f => f.departure === normalizedAirport && f.destination.toLowerCase() === normalizedDest
  );
  if (matches.length > 0) return matches;
  
  // Generate on the fly using a hash key to keep quotes stable
  const mxpMatch = LOCAL_FLIGHTS.find(f => f.destination.toLowerCase() === normalizedDest && f.departure === "MXP");
  if (mxpMatch) {
    const hash = normalizedAirport.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const priceShift = (hash % 40) - 20; // -20 to +20 EUR shift
    return [{
      departure: normalizedAirport,
      destination: mxpMatch.destination,
      price: Math.max(45, mxpMatch.price + priceShift),
      details: `Volo A/R da ${normalizedAirport} (Operato da Partner)`,
      isDirect: hash % 2 === 0
    }];
  }
  
  // Complete fallback
  return [{
    departure: normalizedAirport,
    destination: destination,
    price: 150,
    details: `Volo di linea A/R da ${normalizedAirport}`,
    isDirect: false
  }];
}

// ==========================================
// FIRESTORE AGENT FETCH LOGIC WITH FALLBACKS
// ==========================================

async function fetchLookAlike(target: string): Promise<string> {
  const normalizedTarget = target.trim().toLowerCase();
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, "lookAlikes"), where("target", "==", normalizedTarget));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().alternative;
      }
    } catch (e) {
      console.warn("Firestore error in fetchLookAlike, using local fallback:", e);
    }
  }
  return LOCAL_LOOK_ALIKES[normalizedTarget] || "Rodi";
}

async function fetchFlightsFromDb(departure: string, destination: string) {
  const normalizedDeparture = departure.toUpperCase().trim();
  const normalizedDest = destination.trim();
  
  if (isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "flights"), 
        where("departure", "==", normalizedDeparture), 
        where("destination", "==", normalizedDest)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map(doc => doc.data() as typeof LOCAL_FLIGHTS[0]);
      }
    } catch (e) {
      console.warn(`Firestore error in fetchFlightsFromDb for ${normalizedDest}, using local fallback:`, e);
    }
  }
  return getFlightsForAirport(normalizedDeparture, normalizedDest);
}

async function fetchHotelsFromDb(destination: string) {
  const normalizedDest = destination.trim();
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, "hotels"), where("destination", "==", normalizedDest));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map(doc => doc.data() as typeof LOCAL_HOTELS[0]);
      }
    } catch (e) {
      console.warn(`Firestore error in fetchHotelsFromDb for ${normalizedDest}, using local fallback:`, e);
    }
  }
  return LOCAL_HOTELS.filter(h => h.destination.toLowerCase() === normalizedDest.toLowerCase());
}

// ==========================================
// GRAPH NODES (AGENTS)
// ==========================================

/**
 * 1. ROUTER_PARSER Agent
 * Checks if the user is confused or leaves text blank, and extracts preferences.
 */
export async function routerParserNode(state: TravelGraphState): Promise<Partial<TravelGraphState>> {
  const input = state.userPreferences.rawInput.trim().toLowerCase();
  const isBlind = 
    input.length === 0 || 
    input.includes("non so") || 
    input.includes("confuso") || 
    input.includes("qualsiasi") || 
    input.includes("qualcosa") || 
    input.includes("bho") || 
    input.includes("idee") || 
    input.includes("consigliami");

  // Local roadtrip check
  const isRoad = 
    input.includes("vicino") || 
    input.includes("road trip") || 
    input.includes("auto") || 
    input.includes("macchina") || 
    input.includes("catania") || 
    input.includes("taormina") || 
    input.includes("siracusa") || 
    input.includes("avola");

  const logs = [
    ...state.logs, 
    `[Router Parser] Analisi dell'input utente completata. Ricerca: ${isBlind ? "CIECA" : "GUIDATA"}. Tipo Viaggio: ${isRoad ? "ROAD TRIP (Locale)" : "VOLO (Internazionale)"}.`
  ];

  let detectedMood = state.userPreferences.mood;
  if (input.includes("mare") || input.includes("relax") || input.includes("spiaggia") || input.includes("sole")) {
    detectedMood = "relax";
  } else if (input.includes("cultura") || input.includes("storia") || input.includes("musei") || input.includes("città")) {
    detectedMood = "culture";
  } else if (input.includes("avventura") || input.includes("trekking") || input.includes("sport") || input.includes("natura")) {
    detectedMood = "adventure";
  }

  return {
    userPreferences: {
      ...state.userPreferences,
      isBlindExploration: isBlind,
      isRoadTrip: isRoad,
      mood: detectedMood
    },
    logs
  };
}

/**
 * 2. GEO_EXPLORER Agent
 * Guided Mode: maps meta target and queries fallback look-alikes.
 * Blind Exploration: scans cheap routes or pre-assigns Relax, Culture, Adventure metas.
 */
export async function geoExplorerNode(state: TravelGraphState): Promise<Partial<TravelGraphState>> {
  const isBlind = state.userPreferences.isBlindExploration;
  const isRoad = state.userPreferences.isRoadTrip;
  const departure = state.userPreferences.departureAirport;
  const logs = [...state.logs];
  let discovered: string[] = [];

  if (isRoad && !isBlind) {
    // Road Trip mode
    const input = state.userPreferences.rawInput.toLowerCase();
    let targets: string[] = [];
    if (input.includes("taormina")) targets.push("Taormina");
    if (input.includes("siracusa")) targets.push("Siracusa");
    if (input.includes("avola")) targets.push("Avola");
    
    if (targets.length === 0) {
      // Default nearby destinations (e.g. road trip near Catania)
      targets = ["Taormina", "Siracusa", "Avola"];
    }
    discovered = targets;
    logs.push(`[Geo Explorer] Rilevata modalità RoadTrip locale. Destinazioni individuate: ${discovered.map(d => `"${d}"`).join(", ")}.`);
  } else if (!isBlind) {
    // Guided Mode (Standard Fly)
    const input = state.userPreferences.rawInput.toLowerCase();
    let targetDest = "Creta"; // default fallback if we don't recognize it
    
    // Simple entity extraction matching local keys
    if (input.includes("creta")) targetDest = "Creta";
    else if (input.includes("ibiza")) targetDest = "Ibiza";
    else if (input.includes("parigi")) targetDest = "Parigi";
    else if (input.includes("londra")) targetDest = "Londra";
    else if (input.includes("roma")) targetDest = "Roma";
    else if (input.includes("maldive")) targetDest = "Maldive";

    logs.push(`[Geo Explorer] Destinazione target individuata: "${targetDest}".`);
    
    // Find lookalike
    const alternative = await fetchLookAlike(targetDest);
    logs.push(`[Geo Explorer] Trovata meta alternativa smart (look-alike) adatta: "${alternative}".`);
    
    discovered = [targetDest, alternative];
  } else {
    // Blind Exploration Mode: Select exactly 3 destinations representing the 3 archetypes: Relax, Culture, Adventure
    // Make sure we have direct routes or sensible fallbacks from the requested airport
    logs.push(`[Geo Explorer] Ricerca rotte economiche dirette in corso da "${departure}" per Relax, Cultura ed Avventura.`);
    
    // Archetype destinations:
    const blindRelax = "Tenerife";
    const blindCulture = "Parigi";
    const blindAdventure = "Reykjavik";
    
    discovered = [blindRelax, blindCulture, blindAdventure];
    logs.push(`[Geo Explorer] Selezionate mete di esplorazione: Relax -> "${blindRelax}", Cultura -> "${blindCulture}", Avventura -> "${blindAdventure}".`);
  }

  return {
    discoveredDestinations: discovered,
    logs
  };
}

/**
 * 3. DATA_FETCHER Agent
 * Aggregates flights and hotels to create complete travel packages.
 */
export async function dataFetcherNode(state: TravelGraphState): Promise<Partial<TravelGraphState>> {
  const destinations = state.discoveredDestinations;
  const departure = state.userPreferences.departureAirport;
  const isRoad = state.userPreferences.isRoadTrip;
  const logs = [...state.logs];
  
  if (isRoad) {
    logs.push(`[Data Fetcher] Modalità RoadTrip: calcolo costi auto fisso (carburante/pedaggi) e ricerca hotel locali.`);
  } else {
    logs.push(`[Data Fetcher] Interrogazione voli da "${departure}" e hotel...`);
  }
  
  const rawQuotes: TravelGraphState["rawQuotes"] = [];

  for (const dest of destinations) {
    let flights: { price: number; details: string; isDirect: boolean; isSelfTransfer?: boolean; transferHub?: string }[] = [];
    
    if (isRoad) {
      // Roadtrip: travel cost of 70€ (simulated car fuel/pedals/rental) and no flights
      flights = [{
        price: 70,
        details: "Costo stimato viaggio in Auto (Carburante e Pedaggi)",
        isDirect: true,
        isSelfTransfer: false,
        transferHub: ""
      }];
    } else {
      // Standard Flight Search
      flights = await fetchFlightsFromDb(departure, dest);
      
      // smart autonomous layover (Self-Transfer Hub check)
      const HUBS = ["FCO", "MXP"];
      if (!HUBS.includes(departure.toUpperCase())) {
        for (const hub of HUBS) {
          const toHubFlights = await fetchFlightsFromDb(departure, hub);
          const fromHubFlights = await fetchFlightsFromDb(hub, dest);
          
          if (toHubFlights.length > 0 && fromHubFlights.length > 0) {
            const cheapestToHub = [...toHubFlights].sort((a, b) => a.price - b.price)[0];
            const cheapestFromHub = [...fromHubFlights].sort((a, b) => a.price - b.price)[0];
            const selfTransferPrice = cheapestToHub.price + cheapestFromHub.price;
            
            // Check direct flight cost (if any)
            const cheapestDirect = [...flights].sort((a, b) => a.price - b.price)[0];
            const directPrice = cheapestDirect ? cheapestDirect.price : 9999;
            
            // If self-transfer is cheaper than direct, or if no direct flight exists, add self-transfer option
            if (selfTransferPrice < directPrice || !cheapestDirect) {
              flights.push({
                price: selfTransferPrice,
                details: `Scalo Autonomo Smart (via ${hub})`,
                isDirect: false,
                isSelfTransfer: true,
                transferHub: hub
              });
              logs.push(`[Data Fetcher] Scalo Autonomo Smart rilevato via HUB ${hub} per ${dest}: €${selfTransferPrice} vs Diretto €${directPrice !== 9999 ? directPrice : "non disp."}.`);
            }
          }
        }
      }
    }

    const hotels = await fetchHotelsFromDb(dest);

    // Cross-join flight options and hotel options to generate package quotes
    let quoteIndex = 0;
    for (const flight of flights) {
      for (const hotel of hotels) {
        rawQuotes.push({
          id: `${dest.toLowerCase()}-quote-${quoteIndex++}`,
          destination: dest,
          flightPrice: flight.price,
          flightDetails: flight.details,
          hotelPrice: hotel.price,
          hotelDetails: hotel.details,
          isAllInclusive: hotel.isAllInclusive,
          isDirectFlight: flight.isDirect,
          hotelStars: hotel.stars,
          hotelRating: hotel.rating,
          experienceType: hotel.experienceType as 'relax' | 'culture' | 'adventure',
          isSelfTransfer: flight.isSelfTransfer || false,
          transferHub: flight.transferHub || ""
        });
      }
    }
  }

  logs.push(`[Data Fetcher] Aggregati con successo ${rawQuotes.length} preventivi pacchettizzati (Volo/Auto + Hotel).`);

  return {
    rawQuotes,
    logs
  };
}

/**
 * 4. OPPORTUNIST_UPGRADER Agent
 * Computes if there are packages in the range (budget, budget * (1 + flexibility)]
 * which offer a massive quality leap (all-inclusive, 5 stars, direct flights, high ratings).
 * Uses a value-to-cost ratio formula to score the upgrade opportunity.
 */
export async function opportunistUpgraderNode(state: TravelGraphState): Promise<Partial<TravelGraphState>> {
  const budget = state.userPreferences.budget;
  const flexibility = state.userPreferences.flexibility;
  const maxBudget = budget * (1 + flexibility);
  const logs = [...state.logs, `[Agent Opportunista] Analisi per ricerca Upgrade di valore elevato. Budget Massimo consentito: ${maxBudget.toFixed(2)}€ (Flessibilità: +${(flexibility*100).toFixed(0)}%).`];

  let bestUpgradeQuote: typeof state.rawQuotes[0] | null = null;
  let highestScore = -1;

  // Filter quotes in the upgrade range (exceeding base budget, but below maxBudget)
  const upgradeCandidates = state.rawQuotes.filter(quote => {
    const totalPrice = quote.flightPrice + quote.hotelPrice;
    return totalPrice > budget && totalPrice <= maxBudget;
  });

  logs.push(`[Agent Opportunista] Rilevati ${upgradeCandidates.length} candidati potenziali nella fascia di flessibilità.`);

  for (const quote of upgradeCandidates) {
    const totalPrice = quote.flightPrice + quote.hotelPrice;
    
    // Scoring Algorithm:
    // Base Points:
    let valuePoints = 0;
    if (quote.isDirectFlight) valuePoints += 30; // Volo senza scali
    if (quote.isAllInclusive) valuePoints += 40; // Pasti inclusi (all-inclusive)
    if (quote.hotelStars > 3) valuePoints += (quote.hotelStars - 3) * 15; // 15pt per ogni stella sopra le 3
    if (quote.hotelRating >= 4.5) valuePoints += 20; // Eccellente reputazione utente

    // Additional Cost Ratio:
    const costRatio = totalPrice / budget; // ratio > 1.0

    // Upgrade Score: Value Points divided by the cost premium
    const score = valuePoints / costRatio;

    if (score > highestScore) {
      highestScore = score;
      bestUpgradeQuote = quote;
    }
  }

  // If we found a good upgrade, log and store it
  if (bestUpgradeQuote) {
    const totalCost = bestUpgradeQuote.flightPrice + bestUpgradeQuote.hotelPrice;
    logs.push(`[Agent Opportunista] Trovata un'opzione di upgrade straordinaria per "${bestUpgradeQuote.destination}" a ${totalCost}€ (Punteggio: ${highestScore.toFixed(2)}).`);
  } else {
    logs.push(`[Agent Opportunista] Nessun upgrade con alto valore rilevato all'interno della flessibilità del budget.`);
  }

  // Save the selected upgrade quote ID in a temporary state parameter (or query it directly in synthesis)
  // We'll store the bestUpgradeQuote directly in a custom key, or just pass it in logs/metadata.
  // To avoid changing state schema, we can append it as a metadata query. We will find it again in SYNTHESIZER.
  const updatedState: Partial<TravelGraphState> = { logs };
  if (bestUpgradeQuote) {
    // We can inject a special flag or save it in rawQuotes with a flag
    const updatedQuotes = state.rawQuotes.map(q => {
      if (q.id === bestUpgradeQuote!.id) {
        return { ...q, isSelectedUpgrade: true };
      }
      return q;
    });
    updatedState.rawQuotes = updatedQuotes;
  }

  return updatedState;
}

/**
 * 5. SYNTHESIZER Agent
 * Synthesizes proposals into exactly 3 structured cards based on the selected mode.
 */
export async function synthesizerNode(state: TravelGraphState): Promise<Partial<TravelGraphState>> {
  const isBlind = state.userPreferences.isBlindExploration;
  const isRoad = state.userPreferences.isRoadTrip;
  const budget = state.userPreferences.budget;
  const logs = [...state.logs, `[Synthesizer] Compilazione ed ottimizzazione dei 3 pacchetti finali.`];
  const proposals: TravelGraphState["finalProposals"] = [];

  const getPackageTotal = (q: typeof state.rawQuotes[0]) => q.flightPrice + q.hotelPrice;

  const getCityName = (code: string) => {
    const c = code.toUpperCase().trim();
    if (c === "FCO" || c === "ROM") return "Roma";
    if (c === "MXP" || c === "MIL") return "Milano";
    if (c === "CTA") return "Catania";
    if (c === "PMO") return "Palermo";
    if (c === "NAP") return "Napoli";
    return code;
  };

  const formatFlightDetails = (q: typeof state.rawQuotes[0]) => {
    if (isRoad) {
      return `${q.flightDetails} - €${q.flightPrice}`;
    }
    if (q.isSelfTransfer) {
      return `Soluzione Smart con Scalo Autonomo: Volo da ${state.userPreferences.departureAirport} a ${getCityName(q.transferHub || "")} + Volo da ${getCityName(q.transferHub || "")} alla destinazione finale - €${q.flightPrice}`;
    }
    return `${q.flightDetails} - €${q.flightPrice}`;
  };

  if (!isBlind) {
    // GUIDED MODE: Target, Smart, Upgrade
    const targetDest = state.discoveredDestinations[0];
    const smartDest = state.discoveredDestinations[1] || targetDest; // fallback

    // 1. Target Package
    const targetQuotes = state.rawQuotes
      .filter(q => q.destination === targetDest && getPackageTotal(q) <= budget)
      .sort((a, b) => b.hotelStars - a.hotelStars || b.hotelRating - a.hotelRating);

    const targetQuote = targetQuotes[0] || state.rawQuotes.filter(q => q.destination === targetDest)[0];

    if (targetQuote) {
      const whyChooseText = isRoad 
        ? `Centra in pieno la tua meta richiesta (${targetQuote.destination}) con alloggio di qualità (${targetQuote.hotelStars}★), raggiungibile comodamente in auto entro il tuo budget.`
        : `Centra in pieno la tua meta richiesta con alloggio di qualità (${targetQuote.hotelStars} stelle) restando nel budget concordato.`;

      proposals.push({
        cardType: "target",
        destination: targetQuote.destination,
        title: isRoad ? `Target RoadTrip: ${targetQuote.destination}` : `Target: Esperienza ${targetQuote.destination}`,
        flightDetails: formatFlightDetails(targetQuote),
        hotelDetails: `${targetQuote.hotelDetails} (${targetQuote.hotelStars}★, Rating: ${targetQuote.hotelRating}/5) - €${targetQuote.hotelPrice}`,
        totalPrice: getPackageTotal(targetQuote),
        whyChooseIt: whyChooseText
      });
    }

    // 2. Smart Package
    const smartQuotes = state.rawQuotes
      .filter(q => q.destination === smartDest && getPackageTotal(q) <= budget)
      .sort((a, b) => getPackageTotal(a) - getPackageTotal(b));

    const smartQuote = smartQuotes[0] || state.rawQuotes.filter(q => q.destination === smartDest)[0];

    if (smartQuote) {
      const whyChooseText = isRoad 
        ? `La tua alternativa locale smart a ${smartQuote.destination}. Costo del pernottamento ridotto per garantirti il massimo risparmio sul tragitto stradale.`
        : (smartQuote.isSelfTransfer 
          ? `Risparmio eccezionale grazie allo scalo autonomo via ${getCityName(smartQuote.transferHub || "")}, che abbatte la tariffa aerea per ${smartQuote.destination}.`
          : `Stesso mood di ${targetDest} ma a prezzo ridotto. Ti permette di risparmiare senza rinunciare a volo diretto e confort.`);

      proposals.push({
        cardType: "smart",
        destination: smartQuote.destination,
        title: isRoad ? `Smart RoadTrip: ${smartQuote.destination}` : `Smart: L'Alternativa Look-Alike a ${smartQuote.destination}`,
        flightDetails: formatFlightDetails(smartQuote),
        hotelDetails: `${smartQuote.hotelDetails} (${smartQuote.hotelStars}★) - €${smartQuote.hotelPrice}`,
        totalPrice: getPackageTotal(smartQuote),
        whyChooseIt: whyChooseText
      });
    }

    // 3. Upgrade Package
    // @ts-ignore
    const selectedUpgradeQuote = state.rawQuotes.find(q => q.isSelectedUpgrade === true);
    
    if (selectedUpgradeQuote) {
      const whyChooseText = isRoad
        ? `Sforando di pochissimo il budget base, ottieni un alloggio premium deluxe (${selectedUpgradeQuote.hotelStars}★) all-inclusive nella tua località di road trip.`
        : `Sfora di pochissimo il budget ma ti offre servizi di lusso, volo non-stop o un resort ${selectedUpgradeQuote.isAllInclusive ? "All-Inclusive che azzera i costi dei pasti" : "a 5 stelle"}.`;

      proposals.push({
        cardType: "upgrade",
        destination: selectedUpgradeQuote.destination,
        title: isRoad ? `Upgrade RoadTrip: ${selectedUpgradeQuote.destination}` : `Upgrade: Esperienza Premium a ${selectedUpgradeQuote.destination}`,
        flightDetails: formatFlightDetails(selectedUpgradeQuote),
        hotelDetails: `${selectedUpgradeQuote.hotelDetails} (${selectedUpgradeQuote.hotelStars}★) ${selectedUpgradeQuote.isAllInclusive ? "[All-Inclusive]" : ""} - €${selectedUpgradeQuote.hotelPrice}`,
        totalPrice: getPackageTotal(selectedUpgradeQuote),
        whyChooseIt: whyChooseText
      });
    } else {
      const fallbackQuotes = state.rawQuotes
        .filter(q => q.destination === targetDest)
        .sort((a, b) => getPackageTotal(b) - getPackageTotal(a));
      const fallbackQuote = fallbackQuotes[0] || targetQuote;

      if (fallbackQuote) {
        proposals.push({
          cardType: "upgrade",
          destination: fallbackQuote.destination,
          title: isRoad ? `Upgrade RoadTrip: Suite ${fallbackQuote.destination}` : `Upgrade: Comfort Suite ${fallbackQuote.destination}`,
          flightDetails: formatFlightDetails(fallbackQuote),
          hotelDetails: `${fallbackQuote.hotelDetails} (${fallbackQuote.hotelStars}★) - €${fallbackQuote.hotelPrice}`,
          totalPrice: getPackageTotal(fallbackQuote),
          whyChooseIt: `Opzione di livello superiore con alloggio top di gamma e comfort migliorati per un viaggio indimenticabile.`
        });
      }
    }
  } else {
    // BLIND EXPLORATION MODE
    const relaxDest = state.discoveredDestinations[0]; // Tenerife
    const cultureDest = state.discoveredDestinations[1]; // Parigi
    const adventureDest = state.discoveredDestinations[2]; // Reykjavik

    // 1. Card Relax
    const relaxQuote = state.rawQuotes
      .filter(q => q.destination === relaxDest && q.experienceType === "relax")
      .sort((a, b) => getPackageTotal(a) - getPackageTotal(b))[0] || state.rawQuotes.filter(q => q.destination === relaxDest)[0];

    if (relaxQuote) {
      proposals.push({
        cardType: "relax",
        destination: relaxQuote.destination,
        title: `Relax & Benessere: Fuga a ${relaxQuote.destination}`,
        flightDetails: formatFlightDetails(relaxQuote),
        hotelDetails: `${relaxQuote.hotelDetails} (${relaxQuote.hotelStars}★) - €${relaxQuote.hotelPrice}`,
        totalPrice: getPackageTotal(relaxQuote),
        whyChooseIt: `Selezionato per azzerare lo stress. Include una struttura incentrata sul relax con trattamenti benessere e spiagge vulcaniche.`
      });
    }

    // 2. Card Culture
    const cultureQuote = state.rawQuotes
      .filter(q => q.destination === cultureDest && q.experienceType === "culture")
      .sort((a, b) => getPackageTotal(a) - getPackageTotal(b))[0] || state.rawQuotes.filter(q => q.destination === cultureDest)[0];

    if (cultureQuote) {
      proposals.push({
        cardType: "culture",
        destination: cultureQuote.destination,
        title: `Cultura & City Break: Esplora ${cultureQuote.destination}`,
        flightDetails: formatFlightDetails(cultureQuote),
        hotelDetails: `${cultureQuote.hotelDetails} (${cultureQuote.hotelStars}★) - €${cultureQuote.hotelPrice}`,
        totalPrice: getPackageTotal(cultureQuote),
        whyChooseIt: `Dedicato agli amanti della scoperta. Alloggio in posizione centrale per vivere al meglio musei, teatri ed enogastronomia locale.`
      });
    }

    // 3. Card Adventure
    const adventureQuote = state.rawQuotes
      .filter(q => q.destination === adventureDest && q.experienceType === "adventure")
      .sort((a, b) => getPackageTotal(a) - getPackageTotal(b))[0] || state.rawQuotes.filter(q => q.destination === adventureDest)[0];

    if (adventureQuote) {
      proposals.push({
        cardType: "adventure",
        destination: adventureQuote.destination,
        title: `Avventura & Natura: Adrenalina a ${adventureQuote.destination}`,
        flightDetails: formatFlightDetails(adventureQuote),
        hotelDetails: `${adventureQuote.hotelDetails} (${adventureQuote.hotelStars}★) - €${adventureQuote.hotelPrice}`,
        totalPrice: getPackageTotal(adventureQuote),
        whyChooseIt: `Ideato per chi cerca l'azione. Pacchetto con voli comodi e base logistica ottima per escursioni su ghiacciai, vulcani o sport all'aria aperta.`
      });
    }
  }

  logs.push(`[Synthesizer] Sintesi terminata. Generate esattamente 3 proposte finite e pacchettizzate.`);

  return {
    finalProposals: proposals.slice(0, 3),
    logs
  };
}
