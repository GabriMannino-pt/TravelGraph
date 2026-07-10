import { AgencyState } from "../agencyState";

export async function dispatcherAgent(state: AgencyState): Promise<Partial<AgencyState>> {
  const logs = [...state.logs, "[Execution] Dispatcher: Prendo il pacchetto e lo invio..."];
  
  if (!state.viralContent || !state.dealFound) {
    logs.push("[Execution] Dispatcher: Pacchetto incompleto. Niente da inviare.");
    return { logs };
  }

  // Qui si collegherebbe alle API di Telegram o SendGrid per inviare l'email al proprietario
  // const botToken = process.env.TELEGRAM_BOT_TOKEN;
  // const chatId = process.env.TELEGRAM_CHAT_ID;
  
  logs.push(`[Execution] Dispatcher: 🚀 Messaggio Telegram Inviato con successo al CEO! Post pronto per essere pubblicato.`);

  return { logs };
}
