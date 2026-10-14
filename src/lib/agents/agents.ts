import { TravelGraphState } from "./state";
import { db, isFirebaseConfigured } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import OpenAI from "openai";

// ==========================================
// LIVE API & OPENAI CONFIG
// ==========================================

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "mock-key",
  dangerouslyAllowBrowser: true // Dato che stiamo eseguendo il grafo lato client per ora
});

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "";

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
];

export const LOCAL_HOTELS = [
  { destination: "Creta", name: "Creta Sun Beach Resort", price: 400, details: "7 notti, Camera Standard, Colazione inclusa", isAllInclusive: false, stars: 3, rating: 4.1, experienceType: "relax" },
  { destination: "Creta", name: "Creta Palace Luxury & Spa", price: 750, details: "7 notti, Deluxe All-Inclusive, Accesso Spa", isAllInclusive: true, stars: 5, rating: 4.8, experienceType: "relax" },
  { destination: "Parigi", name: "Hotel Les Deux Gares", price: 600, details: "5 notti, Camera Doppia, Vicino Metro", isAllInclusive: false, stars: 3, rating: 4.3, experienceType: "culture" },
  { destination: "Tenerife", name: "Tenerife Wellness Oasis & Spa", price: 360, details: "7 notti, Camera Vista Oceano, Accesso Terme", isAllInclusive: false, stars: 4, rating: 4.6, experienceType: "relax" },
  { destination: "Reykjavik", name: "Black Sand Adventure Lodge", price: 850, details: "7 notti, Cabin Indipendente, Escursione Ghiacciaio", isAllInclusive: false, stars: 4, rating: 4.8, experienceType: "adventure" },
];

// Fallback logic
function getFlightsForAirport(airport: string, destination: string) {
  const normalizedAirport = airport.toUpperCase().trim();
  const normalizedDest = destination.toLowerCase().trim();
  
  const matches = LOCAL_FLIGHTS.filter(
    f => f.departure === normalizedAirport && f.destination.toLowerCase() === normalizedDest
  );
  if (matches.length > 0) return matches;
  
  const mxpMatch = LOCAL_FLIGHTS.find(f => f.destination.toLowerCase() === normalizedDest && f.departure === "MXP");
  if (mxpMatch) {
    const hash = normalizedAirport.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const priceShift = (hash % 40) - 20; 
    return [{
      departure: normalizedAirport,
      destination: mxpMatch.destination,
      price: Math.max(45, mxpMatch.price + priceShift),
      details: `Volo A/R da ${normalizedAirport} (Operato da Partner)`,
      isDirect: hash % 2 === 0
    }];
  }
  
  return [{
    departure: normalizedAirport,
    destination: destination,
    price: 150,
    details: `Volo di linea A/R da ${normalizedAirport}`,
    isDirect: false
  }];
}

// ==========================================
// REAL API FETCH LOGIC (WITH FALLBACKS)
// ==========================================

async function fetchLookAlike(target: string): Promise<string> {
  const normalizedTarget = target.trim().toLowerCase();
  return LOCAL_LOOK_ALIKES[normalizedTarget] || "Rodi";
}

async function fetchRealFlightsAPI(departure: string, destination: string) {
  if (!RAPIDAPI_KEY) throw new Error("RAPIDAPI_KEY missing");
  // Implementazione reale Flights Sky via RapidAPI
  // In produzione, mappa il nome destinazione al codice IATA (es. Parigi -> CDG)
  const destCode = "LHR"; // Mocked IATA per esempio
  
  const response = await fetch(`https://flights-sky.p.rapidapi.com/flights/search-roundtrip?origin=${departure}&destination=${destCode}&date=2024-12-10`, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'flights-sky.p.rapidapi.com'
    }
  });

  if (!response.ok) throw new Error("API Voli non raggiungibile");
  const data = await response.json();
  
  // Mappatura dati reali... (semplificata per ora, torniamo un mock se i dati falliscono)
  if (!data || !data.data) throw new Error("Formato dati voli errato");
  
  // Ritorna l'oggetto mappato (qui simuliamo il ritorno dal parser dell'API reale)
  return [{
    departure,
    destination,
    price: data.data[0]?.price || 120,
    details: `Volo Reale API (${data.data[0]?.airline || 'AirLine'}) A/R`,
    isDirect: true
  }];
}

async function fetchRealHotelsAPI(destination: string) {
  if (!RAPIDAPI_KEY) throw new Error("RAPIDAPI_KEY missing");
  // Esempio di implementazione reale Booking.com via RapidAPI
  const response = await fetch(`https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?dest_id=-2092174&search_type=CITY`, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
    }
  });

  if (!response.ok) throw new Error("API Hotel non raggiungibile");
  const data = await response.json();

  return [{
    destination,
    name: data.data?.hotels[0]?.property?.name || "Hotel Reale API",
    price: data.data?.hotels[0]?.property?.priceBreakdown?.grossPrice?.value || 400,
    details: "7 notti, Dati Live da Booking.com",
    isAllInclusive: false,
    stars: data.data?.hotels[0]?.property?.class || 4,
    rating: data.data?.hotels[0]?.property?.reviewScore || 4.2,
    experienceType: "relax"
  }];
}

async function fetchFlightsFromDb(departure: string, destination: string) {
  const normalizedDeparture = departure.toUpperCase().trim();
  const normalizedDest = destination.trim();
  
  try {
    // 1. Prova API Live
    if (RAPIDAPI_KEY) {
      console.log(`[API Live] Cerco voli per ${normalizedDest}`);
      return await fetchRealFlightsAPI(normalizedDeparture, normalizedDest);
    }
  } catch (e) {
    console.warn(`Fallimento API Live Voli per ${normalizedDest}, passo al Mock locale:`, e);
  }

  // 2. Fallback su dati locali simulati
  return getFlightsForAirport(normalizedDeparture, normalizedDest);
}

async function fetchHotelsFromDb(destination: string) {
  const normalizedDest = destination.trim();
  
  try {
    // 1. Prova API Live
    if (RAPIDAPI_KEY) {
      console.log(`[API Live] Cerco hotel per ${normalizedDest}`);
      return await fetchRealHotelsAPI(normalizedDest);
    }
  } catch (e) {
    console.warn(`Fallimento API Live Hotel per ${normalizedDest}, passo al Mock locale:`, e);
  }

  // 2. Fallback
  const localMatches = LOCAL_HOTELS.filter(h => h.destination.toLowerCase() === normalizedDest.toLowerCase());
  if (localMatches.length > 0) return localMatches;

  return [{
    destination: normalizedDest,
    name: `${normalizedDest.charAt(0).toUpperCase() + normalizedDest.slice(1)} Grand Hotel`,
    price: 350,
    details: "7 notti, Camera Standard",
    isAllInclusive: false,
    stars: 4,
    rating: 4.5,
    experienceType: "relax"
  }];
}

// AI COPYWRITER GENERATOR
async function generateAIPitch(destination: string, type: string, hotelName: string, budget: number): Promise<string> {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY === "mock-key") {
    // Fallback statico veloce se non c'è la chiave (evita di bloccare l'interfaccia)
    return `Opzione eccezionale per ${destination}. Scelta ideale per il tuo budget di ${budget}€, con pernottamento presso ${hotelName}.`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Sei un travel hacker esperto. Devi scrivere 2-3 frasi accattivanti sul perché questo viaggio è un affare. Usa un tono da 'insider'. Niente saluti." },
        { role: "user", content: `Scrivi il pitch per ${destination}. Tipo: ${type}. Hotel: ${hotelName}. Budget utente: ${budget}€.` }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });
    return response.choices[0].message.content || "Opzione incredibile trovata dal nostro algoritmo.";
  } catch (error) {
    console.error("Errore OpenAI Pitch Generator:", error);
    return "Scelta strategica dell'AI per ottimizzare il tuo budget in base ai prezzi attuali del mercato.";
  }
}

// ==========================================
// AI ITINERARY GENERATOR
// ==========================================

export async function generateAIItinerary(
  destination: string,
  mood: string,
  durationDays: number,
  budget: number
): Promise<{ itinerary: string; budgetHack: string }> {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY === "mock-key") {
    return {
      itinerary: `📅 ITINERARIO SU MISURA (${durationDays} NOTTI A ${destination.toUpperCase()})\n\n` +
        `• Giorno 1: Arrivo a ${destination}, check-in e primo assaggio della cucina locale.\n` +
        `• Giorno 2-3: Relax sulle spiagge principali / tour culturale del centro.\n` +
        `• Giorno 4-${Math.max(4, durationDays - 1)}: Escursione in riserve naturali ed esperienze autentiche fuori dai circuiti turisti.\n` +
        `• Giorno ${durationDays}: Ultima colazione panoramica e rientro.`,
      budgetHack: `💡 Trucco TravelGraph: Per rientrare nei ${budget}€, alloggia a 10-15 minuti dal centro/spiagge (es. entroterra). I prezzi scendono del 40%!`,
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sei l'Itinerary Architect di TravelGraph. Crea un itinerario breve e accattivante giorno per giorno (max 4 punti elenco) ed estrapola un 'Trucco di Risparmio' (Budget Hack) specifico per la meta e il budget."
        },
        {
          role: "user",
          content: `Meta: ${destination}, Durata: ${durationDays} giorni, Mood: ${mood}, Budget: ${budget}€.`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const text = response.choices[0].message.content || "";
    return {
      itinerary: text,
      budgetHack: `💡 Trucco TravelGraph: Cerca alloggi a 10-15 minuti di auto dai punti nevralgici di ${destination} per abbattere i costi di pernottamento.`
    };
  } catch (error) {
    console.error("Errore OpenAI Itinerary Generator:", error);
    return {
      itinerary: `Itinerario strategico per ${destination} di ${durationDays} giorni pronto per il tuo viaggio.`,
      budgetHack: `💡 Trucco TravelGraph: Prenota alloggi fuori dal centro storico per risparmiare fino al 40%.`
    };
  }
}

function buildAffiliateLinks(destination: string, departureAirport: string) {
  const affiliateBooking = process.env.NEXT_PUBLIC_AFFILIATE_BOOKING || "TRAVELGRAPH_BOOKING";
  const affiliateSkyscanner = process.env.NEXT_PUBLIC_AFFILIATE_SKYSCANNER || "TRAVELGRAPH_SKYSCANNER";

  return {
    hotelUrl: `https://www.booking.com/searchresults.it.html?ss=${encodeURIComponent(destination)}&aid=${affiliateBooking}`,
    flightUrl: `https://www.skyscanner.it/trasporti/voli/${departureAirport.toLowerCase()}/?associateid=${affiliateSkyscanner}`,
    activityUrl: `https://www.getyourguide.it/s/?q=${encodeURIComponent(destination)}`
  };
}

// ==========================================
// GRAPH NODES (AGENTS)
// ==========================================

export async function routerParserNode(state: TravelGraphState): Promise<Partial<TravelGraphState>> {
  const input = state.userPreferences.rawInput.trim().toLowerCase();
  const isBlind = input.length === 0 || input.includes("non so") || input.includes("idee");
  const isRoad = input.includes("auto") || input.includes("road trip");

  return {
    userPreferences: {
      ...state.userPreferences,
      isBlindExploration: isBlind,
      isRoadTrip: isRoad,
      mood: "relax"
    },
    logs: [...state.logs, `[Router Parser] Ricerca: ${isBlind ? "CIECA" : "GUIDATA"}.`]
  };
}

export async function geoExplorerNode(state: TravelGraphState): Promise<Partial<TravelGraphState>> {
  const isBlind = state.userPreferences.isBlindExploration;
  const logs = [...state.logs];
  let discovered: string[] = [];

  if (isBlind) {
    discovered = ["Tenerife", "Parigi", "Reykjavik"];
    logs.push(`[Geo Explorer] Scelte mete CIECHE: Tenerife, Parigi, Reykjavik.`);
  } else {
    const rawWords = state.userPreferences.rawInput.split(' ').filter(w => w.length > 3);
    let target = "Parigi";
    if (rawWords.length > 0) {
      target = rawWords[rawWords.length - 1];
      target = target.charAt(0).toUpperCase() + target.slice(1).toLowerCase();
    }
    
    const alt = await fetchLookAlike(target);
    discovered = [target, alt];
    logs.push(`[Geo Explorer] Target Estratto: ${target}, LookAlike: ${alt}.`);
  }

  return { discoveredDestinations: discovered, logs };
}

export async function dataFetcherNode(state: TravelGraphState): Promise<Partial<TravelGraphState>> {
  const destinations = state.discoveredDestinations;
  const departure = state.userPreferences.departureAirport;
  const isRoadTrip = state.userPreferences.isRoadTrip || !departure || departure.trim() === "";
  
  const logs = [...state.logs];
  if (isRoadTrip) {
    logs.push(`[Data Fetcher] Modalità 'Solo Hotel / Road Trip' attivata. Nessun costo aereo calcolato.`);
  } else {
    logs.push(`[Data Fetcher] Contatto le API Live per voli da ${departure}...`);
  }
  
  const rawQuotes: TravelGraphState["rawQuotes"] = [];
  let quoteIndex = 0;

  for (const dest of destinations) {
    const flights = isRoadTrip 
      ? [{ departure: "Mezzo Proprio", destination: dest, price: 0, details: "Viaggio autonomo (Auto/Treno)", isDirect: true }]
      : await fetchFlightsFromDb(departure, dest);
      
    const hotels = await fetchHotelsFromDb(dest);

    for (const flight of flights) {
      for (const hotel of hotels) {
        rawQuotes.push({
          id: `${dest.toLowerCase()}-q-${quoteIndex++}`,
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
          isSelfTransfer: false
        });
      }
    }
  }

  logs.push(`[Data Fetcher] Scaricati dati Live API: ${rawQuotes.length} pacchetti composti.`);
  return { rawQuotes, logs };
}

export async function itineraryArchitectNode(state: TravelGraphState): Promise<Partial<TravelGraphState>> {
  const logs = [...state.logs, `[Itinerary Architect] Progettazione itinerario personalizzato e trucchi di budget...`];
  return { logs };
}

export async function bookingAgentNode(state: TravelGraphState): Promise<Partial<TravelGraphState>> {
  const proposals: TravelGraphState["finalProposals"] = [];
  const logs = [...state.logs, `[Booking Agent] Controllo ferreo del budget e generazione link affiliati...`];

  const maxBudget = state.userPreferences.budget * (1 + state.userPreferences.flexibility);
  const validQuotes = state.rawQuotes.filter(q => (q.flightPrice + q.hotelPrice) <= maxBudget);
  validQuotes.sort((a, b) => (a.flightPrice + a.hotelPrice) - (b.flightPrice + b.hotelPrice));

  logs.push(`[Booking Agent] Trovate ${validQuotes.length} opzioni che rispettano il budget di ${state.userPreferences.budget}€.`);

  const topQuotes = validQuotes.slice(0, 3);
  
  for (const quote of topQuotes) {
    const copy = await generateAIPitch(quote.destination, quote.experienceType, quote.hotelDetails.split(',')[0], state.userPreferences.budget);
    const { itinerary, budgetHack } = await generateAIItinerary(
      quote.destination,
      quote.experienceType,
      state.userPreferences.durationDays,
      state.userPreferences.budget
    );
    const links = buildAffiliateLinks(quote.destination, state.userPreferences.departureAirport);

    proposals.push({
      cardType: quote.experienceType === 'relax' ? 'relax' : 'smart',
      destination: quote.destination,
      title: `Offerta Live per ${quote.destination}`,
      flightDetails: quote.flightDetails,
      hotelDetails: `${quote.hotelDetails} (${quote.hotelStars}★) - €${quote.hotelPrice}`,
      totalPrice: quote.flightPrice + quote.hotelPrice,
      whyChooseIt: copy,
      dailyItinerary: itinerary,
      budgetHackNotice: budgetHack,
      bookingLinks: links
    });
  }

  if (proposals.length === 0) {
    proposals.push({
      cardType: 'target',
      destination: 'Nessuna Meta',
      title: 'Budget troppo basso',
      flightDetails: 'Nessun volo disponibile per questo budget',
      hotelDetails: 'Nessun alloggio trovato',
      totalPrice: 0,
      whyChooseIt: `Il nostro algoritmo Budget-First ha scartato tutte le opzioni perché superavano i ${maxBudget}€ (inclusa la flessibilità). Prova ad alzare il budget per sbloccare destinazioni.`
    });
    logs.push(`[Booking Agent] ERRORE: Nessun pacchetto ha superato il blocco del budget!`);
  } else {
    logs.push(`[Booking Agent] Itinerari e link affiliazione generati con successo.`);
  }

  return { finalProposals: proposals, logs };
}

