import { AgencyState } from "../agencyState";
import { db, isFirebaseConfigured } from "../../firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export async function performanceAnalystAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[C-Suite] Performance Analyst: Analizzo i feedback delle campagne precedenti da Firebase..."];
  
  if (!isFirebaseConfigured) {
    logs.push("[C-Suite] Performance Analyst: ⚠️ Firebase non configurato. Salto l'analisi storica.");
    return { logs };
  }

  try {
    const feedbackRef = collection(db, "campaign_feedback");
    const q = query(feedbackRef, orderBy("createdAt", "desc"), limit(10));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      logs.push("[C-Suite] Performance Analyst: Nessun dato storico trovato. Modalità esplorativa autorizzata (Cold Start).");
      return { logs };
    }

    let bestCampaign: any = null;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!bestCampaign || ((data.views || 0) > (bestCampaign.views || 0))) {
        bestCampaign = data;
      }
    });

    if (bestCampaign) {
      logs.push(`[C-Suite] Performance Analyst: 📈 La campagna storicamente più virale è stata "${bestCampaign.destination}" con ${bestCampaign.views} views.`);
      
      const insight = `Insight Storico: Il format usato per ${bestCampaign.destination} ha generato ${bestCampaign.views} views. Cerca di replicare o battere questo engagement.`;
      
      return {
        marketTrends: {
          ...state.marketTrends,
          historicalInsights: [insight]
        },
        logs
      };
    }

  } catch (error: any) {
    // If the index is missing, it will throw. We log gracefully.
    logs.push(`[C-Suite] Performance Analyst: Errore lettura feedback o indice mancante (${error.message}).`);
  }

  return { logs };
}
