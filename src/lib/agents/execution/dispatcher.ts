import { AgencyState } from "../agencyState";

export async function dispatcherAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[Execution] Dispatcher: Prendo il pacchetto e lo invio..."];
  
  if (!state.viralContent || !state.dealFound) {
    logs.push("[Execution] Dispatcher: Pacchetto incompleto. Niente da inviare.");
    return { logs };
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    try {
      const message = `🚨 *NUOVA CAMPAGNA PRONTA* 🚨\n\n` +
                      `✈️ *Rotta:* ${state.dealFound.origin} ➔ ${state.dealFound.destination}\n` +
                      `💰 *Prezzo Scovato:* ${state.dealFound.price}€ (invece di ${state.dealFound.regularPrice}€)\n\n` +
                      `📝 *COPY PER TIKTOK/IG:*\n${state.viralContent.caption}\n\n` +
                      `📷 *Immagine (Visual):* ${state.visualAssetUrl || "N/A"}`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown"
        })
      });
      logs.push(`[Execution] Dispatcher: 🚀 Messaggio Telegram Inviato con successo al CEO!`);
    } catch (e) {
      logs.push(`[Execution] Dispatcher: Errore durante l'invio Telegram.`);
    }
  } else {
    logs.push(`[Execution] Dispatcher: ⚠️ Chiavi Telegram mancanti. Salto l'invio della notifica.`);
  }

  return { logs };
}
