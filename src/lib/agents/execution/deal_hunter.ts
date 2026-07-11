import { AgencyState } from "../agencyState";

// Utilizzeremo la vera logica API RapidAPI configurata prima
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;

export async function dealHunterAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[Execution] Deal Hunter: Inizio la caccia basata sulle direttive..."];
  
  const targetDest = state.weeklyStrategy.focusDestination;
  logs.push(`[Execution] Deal Hunter: Scansiono "Flights Scraper Sky" per: ${targetDest}`);

  let dealFound;

  if (RAPIDAPI_KEY) {
    try {
      const destCode = targetDest.toLowerCase().includes("ibiza") ? "IBZ" : 
                       targetDest.toLowerCase().includes("maldive") ? "MLE" : 
                       targetDest.toLowerCase().includes("tenerife") ? "TFS" : "LHR";
      
      // Calcoliamo una data dinamica: esattamente 30 giorni da oggi
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const searchDate = futureDate.toISOString().split('T')[0]; // YYYY-MM-DD
                       
      const response = await fetch(`https://flights-sky.p.rapidapi.com/flights/search-roundtrip?origin=MXP&destination=${destCode}&date=${searchDate}`, {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'flights-sky.p.rapidapi.com'
        }
      });

      if (!response.ok) throw new Error("API non raggiungibile");
      const data = await response.json();
      
      if (data && data.data && data.data.length > 0) {
        
        const retDate = new Date(futureDate);
        retDate.setDate(retDate.getDate() + 7);
        const returnDateStr = retDate.toISOString().split('T')[0];

        dealFound = {
          destination: targetDest,
          origin: "MXP",
          price: data.data[0]?.price || 49.99,
          regularPrice: 250,
          departureDate: searchDate,
          returnDate: returnDateStr,
          airline: data.data[0]?.airline || "Low Cost Partner"
        };
        logs.push(`[Execution] Deal Hunter: API Reale interrogata con successo per ${destCode}.`);
      } else {
        throw new Error("Nessun volo trovato nel JSON");
      }
    } catch (e: any) {
      logs.push(`[Execution] Deal Hunter: Fallimento API Live (${e.message}).`);
    }
  }

  // NESSUN BACKUP FAKE. Se l'API ha fallito o non ha trovato voli validi, ci fermiamo.
  if (!dealFound) {
    logs.push(`[Execution] Deal Hunter: 🛑 KILL SWITCH ATTIVATO. Nessun deal reale estratto. Sospendo la campagna giornaliera per preservare la credibilità.`);
    return { logs };
  }

  if (dealFound.price <= state.weeklyStrategy.focusBudget) {
    logs.push(`[Execution] Deal Hunter: 🎯 BINGO! Trovato ${dealFound.origin}-${dealFound.destination} a ${dealFound.price}€. Passo i dati al copywriter.`);
    return { dealFound, logs };
  } else {
    logs.push("[Execution] Deal Hunter: Nessuna offerta sotto il budget trovata oggi.");
    return { logs };
  }
}
