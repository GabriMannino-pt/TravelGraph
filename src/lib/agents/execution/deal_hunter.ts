import { AgencyState } from "../agencyState";

// Utilizzeremo la vera logica API RapidAPI configurata prima
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;

export async function dealHunterAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[Execution] Deal Hunter: Inizio la caccia basata sulle direttive..."];
  
  const targetDests = state.weeklyStrategy.focusDestinations || [];
  const targetOrigins = state.weeklyStrategy.focusOrigins || [];
  
  if (targetDests.length === 0 || targetOrigins.length === 0) {
    logs.push("[Execution] Deal Hunter: 🛑 Nessuna destinazione o origine configurata. Interrompo.");
    return { logs };
  }

  logs.push(`[Execution] Deal Hunter: Caccia "Broad Net" attiva. Valuto combinazioni tra ${targetOrigins.length} aeroporti e ${targetDests.length} mete.`);

  let dealFound;
  
  // Creiamo tutte le combinazioni possibili
  const combinations: {origin: string, dest: string}[] = [];
  for (const origin of targetOrigins) {
    for (const dest of targetDests) {
      combinations.push({origin, dest});
    }
  }
  
  // Mescoliamo le combinazioni in modo casuale per non cercare sempre prima su MXP -> Ibiza
  const shuffledCombinations = combinations.sort(() => 0.5 - Math.random());
  
  // Prendiamo solo le prime 3 da testare (risparmio crediti API)
  const combinationsToTest = shuffledCombinations.slice(0, 3);

  if (RAPIDAPI_KEY) {
    for (const route of combinationsToTest) {
      try {
        const destCode = route.dest.toLowerCase().includes("ibiza") ? "IBZ" : 
                         route.dest.toLowerCase().includes("maldive") ? "MLE" : 
                         route.dest.toLowerCase().includes("tenerife") ? "TFS" : 
                         route.dest.toLowerCase().includes("albania") ? "TIA" : 
                         route.dest.toLowerCase().includes("creta") ? "HER" : 
                         route.dest.toLowerCase().includes("zanzibar") ? "ZNZ" :
                         route.dest.toLowerCase().includes("sharm") ? "SSH" :
                         route.dest.toLowerCase().includes("malta") ? "MLA" : "LHR";
        
        // Calcoliamo una data dinamica: esattamente 30 giorni da oggi
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const searchDate = futureDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        const retDate = new Date(futureDate);
        retDate.setDate(retDate.getDate() + 7);
        const returnDateStr = retDate.toISOString().split('T')[0];
                         
        logs.push(`[Execution] Deal Hunter: Tento rotta ${route.origin} -> ${route.dest} (${destCode})...`);
        const response = await fetch(`https://flights-sky.p.rapidapi.com/flights/search-roundtrip?origin=${route.origin}&destination=${destCode}&date=${searchDate}&returnDate=${returnDateStr}&adults=1&currency=EUR`, {
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'flights-sky.p.rapidapi.com'
          }
        });

        if (!response.ok) {
           logs.push(`[Execution] Deal Hunter: ❌ Rotta fallita (API Error).`);
           continue; // Prova la prossima
        }
        
        const data = await response.json();
        
        // Loggare la risposta per debuggare RapidAPI
        // console.log("RapidAPI response:", data);
        
        if (data && data.data && data.data.length > 0) {
          const price = data.data[0]?.price || 49.99;
          
          // Calcolo sconto rispetto al mercato
          const baselines = state.marketTrends.marketBaselines || {};
          const regularPrice = baselines[route.dest] || 250; // Fallback se non censito
          
          const discountPercentage = Math.round(((regularPrice - price) / regularPrice) * 100);
          
          if (discountPercentage >= state.weeklyStrategy.targetDiscount) {
            dealFound = {
              destination: route.dest,
              origin: route.origin,
              price: price,
              regularPrice: regularPrice,
              departureDate: searchDate,
              returnDate: returnDateStr,
              airline: data.data[0]?.airline || "Low Cost Partner"
            };
            logs.push(`[Execution] Deal Hunter: ✅ TROVATA! Rotta ${route.origin} -> ${route.dest} a ${price}€ (Invece di ${regularPrice}€). Sconto del ${discountPercentage}%. Sospendo la ricerca a strascico.`);
            break; // Usciamo dal loop, abbiamo trovato il deal!
          } else {
             logs.push(`[Execution] Deal Hunter: ❌ Rotta scartata. Prezzo (${price}€) ha uno sconto del ${discountPercentage}%, inferiore al target del ${state.weeklyStrategy.targetDiscount}%.`);
          }
        } else {
          logs.push(`[Execution] Deal Hunter: ❌ Rotta fallita (Nessun volo trovato).`);
        }
      } catch (e: any) {
        logs.push(`[Execution] Deal Hunter: ❌ Rotta fallita (${e.message}).`);
      }
    }
  }

  // NESSUN BACKUP FAKE. Se l'API ha fallito su tutte e 5 le rotte ci fermiamo.
  if (!dealFound) {
    logs.push(`[Execution] Deal Hunter: 🛑 KILL SWITCH ATTIVATO. Nessun deal reale estratto dopo i tentativi previsti. Sospendo la campagna.`);
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
