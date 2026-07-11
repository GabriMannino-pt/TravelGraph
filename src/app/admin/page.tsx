'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ShieldAlert, TrendingUp, Send, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminFeedbackPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [destination, setDestination] = useState('');
  const [hook, setHook] = useState('');
  const [views, setViews] = useState('');
  const [clicks, setClicks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // In un'app reale verificheremmo anche se ha il ruolo 'admin' nel database
      if (!currentUser) {
        router.push('/');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !views) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "campaign_feedback"), {
        destination,
        hook: hook || "Nessun hook specifico",
        views: Number(views),
        clicks: Number(clicks) || 0,
        createdAt: serverTimestamp(),
        authorEmail: user?.email
      });
      
      setSuccess(true);
      setDestination('');
      setHook('');
      setViews('');
      setClicks('');
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Errore salvataggio feedback:", error);
      alert("Errore di salvataggio");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Caricamento...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => router.push('/')}>
          <ShieldAlert className="h-8 w-8 text-indigo-500" />
          <h1 className="text-3xl font-bold tracking-tight">C-Suite Command Center</h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Feedback Loop Marketing</h2>
              <p className="text-zinc-400 text-sm">Inserisci i risultati dei post per addestrare il Performance Analyst.</p>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Dati immagazzinati con successo! L'AI li leggerà domani.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Destinazione Campagna</label>
                <input 
                  type="text" 
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Es. Ibiza" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Hook Utilizzato (Opzionale)</label>
                <input 
                  type="text" 
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="Es. Errore Sistema 34€" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Visualizzazioni (Views)</label>
                <input 
                  type="number" 
                  required
                  value={views}
                  onChange={(e) => setViews(e.target.value)}
                  placeholder="Es. 15000" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Click sul Link (Opzionale)</label>
                <input 
                  type="number" 
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                  placeholder="Es. 450" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Salvataggio...' : 'Invia Dati all\'Intelligenza Artificiale'}
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
