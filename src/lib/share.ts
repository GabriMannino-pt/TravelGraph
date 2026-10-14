/**
 * Helper per il Viral Share Engine di TravelGraph.
 * Genera link e testi formattati per la condivisione virale.
 */

export interface ShareData {
  destination: string;
  totalPrice: number;
  departureAirport?: string;
  durationDays?: number;
}

export function generateShareUrl(data: ShareData): string {
  if (typeof window === 'undefined') return '';
  const baseUrl = window.location.origin;
  const params = new URLSearchParams();
  params.set('dest', data.destination);
  params.set('price', String(data.totalPrice));
  if (data.departureAirport) params.set('origin', data.departureAirport);
  if (data.durationDays) params.set('days', String(data.durationDays));
  params.set('ref', 'viral_share');

  return `${baseUrl}/?${params.toString()}`;
}

export function generateViralShareText(data: ShareData): string {
  const shareUrl = generateShareUrl(data);
  return `🚨 Guardate cosa ha trovato l'AI di TravelGraph! 🏝️ ${data.destination}: viaggio completo a soli ${data.totalPrice}€! 

Guarda l'itinerario personalizzato ed il trucco per risparmiare qui:
${shareUrl}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error("Errore copia negli appunti:", err);
    return false;
  }
}
