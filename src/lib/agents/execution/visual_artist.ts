import { AgencyState } from "../agencyState";

export async function visualArtistAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[Execution] Visual Artist: Generazione visual asset..."];
  
  if (!state.dealFound) {
    logs.push("[Execution] Visual Artist: Nessuna destinazione fornita.");
    return { logs };
  }

  // In produzione si collegherebbe all'API di Unsplash o a DALL-E per scaricare l'immagine della meta
  const destination = state.dealFound.destination;
  const mockImageUrl = `https://source.unsplash.com/1080x1920/?${encodeURIComponent(destination)},luxury,travel`;
  
  logs.push(`[Execution] Visual Artist: Asset fotografico generato per ${destination}.`);

  return {
    visualAssetUrl: mockImageUrl,
    logs
  };
}
