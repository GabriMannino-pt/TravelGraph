import { AgencyState } from "../agencyState";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "mock-key" });

export async function viralCopywriterAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[Execution] Viral Copywriter: Inizio la scrittura del copione..."];
  
  if (!state.dealFound) {
    logs.push("[Execution] Viral Copywriter: Nessuna offerta fornita. Mi fermo.");
    return { logs };
  }

  const { destination, price, regularPrice } = state.dealFound;
  
  // Prompt reale per generare il copy
  /* 
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `Sei un TikToker virale. Tone of voice: ${state.brandGuidelines.toneOfVoice}` },
      { role: "user", content: `Scrivi un video per ${destination} a ${price}€ invece di ${regularPrice}€.` }
    ]
  });
  */

  const deal = state.dealFound;
  const targetAudience = state.brandGuidelines.targetAudience;
  const tone = state.brandGuidelines.toneOfVoice;
  
  const discount = Math.round(((deal.regularPrice - deal.price) / deal.regularPrice) * 100);

  // Mock della risposta per sviluppo
  const viralContent = {
    hook: `TESTO SCHERMO: ${deal.destination.toUpperCase()} A ${deal.price}€ INVECE DI ${deal.regularPrice}€ 😱`,
    voiceover: `Tutti pagano ${deal.destination} ${deal.regularPrice}€. Sbagliato! Ho craccato l'algoritmo e l'ho trovato a ${deal.price}€. Sconto del ${discount}%! Sbrigati prima che lo cancellino!`,
    caption: `🚨 ERRORE SISTEMA: ${deal.destination} a ${deal.price}€ invece di ${deal.regularPrice}€! Sconto del ${discount}%. Commenta ${deal.destination.toUpperCase()} per il link.`,
    hashtags: [`#${destination.toLowerCase()}`, "#volilowcost", "#errorfare"]
  };

  logs.push(`[Execution] Viral Copywriter: Copione e Caption generati con successo.`);

  return { viralContent, logs };
}
