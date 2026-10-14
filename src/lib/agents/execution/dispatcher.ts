import { AgencyState } from "../agencyState";

export async function dispatcherAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[Execution] Dispatcher: Prendo il pacchetto e lo invio..."];
  
  if (!state.viralContent || !state.dealFound) {
    logs.push("[Execution] Dispatcher: Pacchetto incompleto. Niente da inviare.");
    return { logs };
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    try {
      const caption = `🚨 *NUOVA CAMPAGNA TRAVELGRAPH PRONTA* 🚨\n\n` +
                      `✈️ *DEAL:* ${state.dealFound.origin} ➔ ${state.dealFound.destination} a *${state.dealFound.price}€* (invece di ${state.dealFound.regularPrice}€)\n\n` +
                      `📝 *COPY PRONTO PER TIKTOK/IG:*\n${state.viralContent.caption}\n\n` +
                      `🔗 *LINK DEEP LINK DA INSERIRE IN BIO:*\nhttps://main.d3lcweteuo9gs7.amplifyapp.com/?dest=${encodeURIComponent(state.dealFound.destination)}&price=${state.dealFound.price}&origin=${state.dealFound.origin}`;

      // Se abbiamo un'immagine promozionale, inviamo sendPhoto con didascalia
      if (state.visualAssetUrl && state.visualAssetUrl.startsWith("http")) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            photo: state.visualAssetUrl,
            caption: caption,
            parse_mode: "Markdown"
          })
        });
      } else {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: caption,
            parse_mode: "Markdown"
          })
        });
      }

      logs.push(`[Execution] Dispatcher: 🚀 Notifica Telegram e pacchetto pronti inviati con successo al tuo telefono!`);
    } catch (e) {
      logs.push(`[Execution] Dispatcher: Errore durante l'invio su Telegram.`);
    }
  } else {
    logs.push(`[Execution] Dispatcher: ⚠️ Chiavi Telegram mancanti in env. Aggiungi TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID per ricevere i post sul telefono.`);
  }

  return { logs };
}
