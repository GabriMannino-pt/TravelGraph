import { db, isFirebaseConfigured } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

/**
 * Salva l'email di un utente per il Secret Deal Radar su Firestore.
 */
export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: "Inserisci un indirizzo email valido." };
  }

  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase non configurato, simulazione iscrizione newsletter per:", cleanEmail);
    return { success: true, message: "Iscrizione completata con successo! (Modalità Demo)" };
  }

  try {
    const q = query(collection(db, "newsletter_subscribers"), where("email", "==", cleanEmail));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { success: true, message: "Sei già iscritto al Deal Radar!" };
    }

    await addDoc(collection(db, "newsletter_subscribers"), {
      email: cleanEmail,
      createdAt: serverTimestamp(),
      source: "web_radar_lead_gen"
    });

    return { success: true, message: "Fantastico! Ti avviseremo appena l'AI scova un errore di prezzo!" };
  } catch (error: any) {
    console.error("Errore salvataggio newsletter:", error);
    return { success: false, message: "Errore durante l'iscrizione. Riprova tra poco." };
  }
}
