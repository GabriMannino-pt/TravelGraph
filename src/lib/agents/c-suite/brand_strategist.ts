import { AgencyState } from "../agencyState";

export async function brandStrategistAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[C-Suite] Brand Strategist: Allineamento Tone of Voice..."];
  
  // In produzione, questo agente potrebbe leggere i feedback utente e aggiustare il tone of voice
  const toneOfVoice = "Estremo, Sensazionale, Esclusivo";
  logs.push(`[C-Suite] Brand Strategist: Tone of Voice impostato su "${toneOfVoice}".`);

  return {
    brandGuidelines: {
      ...state.brandGuidelines,
      toneOfVoice
    },
    logs
  };
}
