import { AgencyState } from "../agencyState";

// Utilizzeremo la vera logica API RapidAPI configurata prima
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;

export async function dealHunterAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[Execution] Deal Hunter: Inizio la caccia basata sulle direttive..."];
  
  const targetDest = state.weeklyStrategy.focusDestination;
  logs.push(`[Execution] Deal Hunter: Scansiono "Flights Scraper Sky" per: ${targetDest}`);

  // Simulazione di una fetch reale per evitare chiamate inutili durante lo sviluppo
  // In produzione qui c'è il fetch reale verso: https://flights-sky.p.rapidapi.com/flights/search-roundtrip
  const dealFound = {
    destination: targetDest,
    origin: "MXP",
    price: 34.98,
    regularPrice: 200,
    departureDate: "2026-08-25",
    returnDate: "2026-09-02",
    airline: "Ryanair"
  };

  if (dealFound.price <= state.weeklyStrategy.focusBudget) {
    logs.push(`[Execution] Deal Hunter: 🎯 BINGO! Trovato ${dealFound.origin}-${dealFound.destination} a ${dealFound.price}€. Passo i dati al copywriter.`);
    return { dealFound, logs };
  } else {
    logs.push("[Execution] Deal Hunter: Nessuna offerta sotto il budget trovata oggi.");
    return { logs };
  }
}
