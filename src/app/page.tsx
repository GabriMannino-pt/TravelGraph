'use client';

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Sliders, 
  DollarSign, 
  Plane, 
  Hotel, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  MapPin, 
  ChevronRight,
  Sun,
  BookOpen,
  Activity,
  Maximize2,
  Lock,
  Mail,
  Crown
} from 'lucide-react';
import { TravelGraphState } from '@/lib/agents/state';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TravelGraphHome() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.email));
          if (userDoc.exists() && userDoc.data().isPro) {
            setIsPro(true);
          } else {
            setIsPro(false);
          }
        } catch (e) {
          console.error("Errore lettura PRO:", e);
        }
      } else {
        setIsPro(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Deep Link (TikTok Funnel)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dest = params.get('dest');
      const price = params.get('price');
      const origin = params.get('origin');
      
      if (dest && price && origin) {
        // Simula immediatamente il risultato per il TikTok Funnel
        const fakeResult: TravelGraphState = {
          rawInput: `Offerta Flash ${origin} - ${dest}`,
          budget: Number(price) + 50,
          flexibility: 0.1,
          departureAirport: origin,
          durationDays: 7,
          departureDate: new Date().toISOString().split('T')[0],
          isBlindExploration: false,
          isRoadTrip: false,
          targetDestinations: [dest],
          finalProposals: [
            {
              id: 'deal-1',
              title: `Fuga a ${dest} (Error Fare)`,
              destination: dest,
              totalPrice: Number(price),
              flightDetails: `Volo diretto da ${origin} a ${dest} - Trovato dai nostri Bot.`,
              hotelDetails: `Alloggio da definire (prenota il volo prima che sparisca!).`,
              whyChooseIt: `🚨 TARIFFA ERRORE: L'algoritmo ha trovato questa tariffa anomala. Prenota immediatamente, le compagnie correggono questi errori in poche ore.`,
              cardType: 'target'
            }
          ],
          logs: ['[System] Deal Funnel attivato dal Deep Link.']
        };
        
        setDepartureAirport(origin);
        setApiResult(fakeResult);
        setShowResults(true);
      }
    }
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      handleLogin();
      return;
    }
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, returnUrl: window.location.origin })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Input Form State
  const [rawInput, setRawInput] = useState('');
  const [budget, setBudget] = useState(600);
  const [flexibility, setFlexibility] = useState(0.15);
  const [departureAirport, setDepartureAirport] = useState('MXP');
  const [durationDays, setDurationDays] = useState(7);
  const [departureDate, setDepartureDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default to 7 days from today
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Flow State
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [apiResult, setApiResult] = useState<TravelGraphState | null>(null);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedProposalForBooking, setSelectedProposalForBooking] = useState<any | null>(null);

  // Affiliate IDs placeholders (Da personalizzare)
  const AFFILIATE_SKYSCANNER = "TUO_ID_SKYSCANNER"; 
  const AFFILIATE_BOOKING = "TUO_ID_BOOKING"; 
  const AFFILIATE_GYG = "TUO_ID_GETYOURGUIDE";

  const getAirportName = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    const mapping: Record<string, string> = {
      "MXP": "Milano Malpensa",
      "FCO": "Roma Fiumicino",
      "CTA": "Catania Fontanarossa",
      "PMO": "Palermo Falcone-Borsellino",
      "NAP": "Napoli Capodichino",
      "LIN": "Milano Linate",
      "BGY": "Bergamo Orio al Serio",
      "VCE": "Venezia Marco Polo",
      "BLQ": "Bologna Guglielmo Marconi",
      "TRN": "Torino Caselle",
      "FLR": "Firenze Peretola",
      "PSA": "Pisa San Giusto",
      "BRI": "Bari Palese",
      "SUF": "Lamezia Terme",
      "CAG": "Cagliari Elmas"
    };
    return mapping[cleanCode] || null;
  };

  const DEST_CODES: Record<string, string> = {
    "Creta": "HER",
    "Rodi": "RHO",
    "Ibiza": "IBZ",
    "Maiorca": "PMI",
    "Parigi": "PAR",
    "Lione": "LYS",
    "Londra": "LON",
    "Manchester": "MAN",
    "Roma": "FCO",
    "Napoli": "NAP",
    "Maldive": "MLE",
    "Zanzibar": "ZNZ",
    "Tenerife": "TFS",
    "Reykjavik": "KEF",
  };

  const getSkyscannerUrl = (dep: string, destName: string, departureDateStr: string, duration: number) => {
    const destCode = DEST_CODES[destName] || "HER";
    
    // Format outbound date: from YYYY-MM-DD to YYMMDD
    const parts = departureDateStr.split('-');
    if (parts.length !== 3) return `https://www.skyscanner.it/trasporti/voli/${dep.toLowerCase()}/${destCode.toLowerCase()}/?associateid=${AFFILIATE_SKYSCANNER}`;
    
    const yy = parts[0].substring(2);
    const mm = parts[1];
    const dd = parts[2];
    const outbound = `${yy}${mm}${dd}`;

    // Calculate inbound date
    const date = new Date(departureDateStr);
    if (isNaN(date.getTime())) return `https://www.skyscanner.it/trasporti/voli/${dep.toLowerCase()}/${destCode.toLowerCase()}/?associateid=${AFFILIATE_SKYSCANNER}`;
    date.setDate(date.getDate() + duration);
    const returnYy = String(date.getFullYear()).substring(2);
    const returnMm = String(date.getMonth() + 1).padStart(2, '0');
    const returnDd = String(date.getDate()).padStart(2, '0');
    const inbound = `${returnYy}${returnMm}${returnDd}`;

    return `https://www.skyscanner.it/trasporti/voli/${dep.toLowerCase()}/${destCode.toLowerCase()}/${outbound}/${inbound}/?outboundaltsenabled=false&inboundaltsenabled=false&preferdirects=false&ref=home&associateid=${AFFILIATE_SKYSCANNER}`;
  };

  const getBookingUrl = (destName: string, departureDateStr: string, duration: number) => {
    // Format checkout date
    const checkin = departureDateStr;
    const date = new Date(departureDateStr);
    if (isNaN(date.getTime())) {
      return `https://www.booking.com/searchresults.it.html?ss=${encodeURIComponent(destName)}&aid=${AFFILIATE_BOOKING}`;
    }
    date.setDate(date.getDate() + duration);
    const checkoutYyyy = date.getFullYear();
    const checkoutMm = String(date.getMonth() + 1).padStart(2, '0');
    const checkoutDd = String(date.getDate()).padStart(2, '0');
    const checkout = `${checkoutYyyy}-${checkoutMm}-${checkoutDd}`;

    return `https://www.booking.com/searchresults.it.html?ss=${encodeURIComponent(destName)}&checkin=${checkin}&checkout=${checkout}&aid=${AFFILIATE_BOOKING}`;
  };

  const getGygUrl = (destName: string) => {
    return `https://www.getyourguide.it/s/?q=${encodeURIComponent(destName)}&partner_id=${AFFILIATE_GYG}`;
  };

  // Agent Steps Definition
  const steps = [
    { name: 'ROUTER_PARSER', desc: "Analisi dell'input e classificazione dell'esplorazione..." },
    { name: 'GEO_EXPLORER', desc: 'Ricerca delle mete target e delle alternative look-alike...' },
    { name: 'DATA_FETCHER', desc: 'Recupero tariffe voli e hotel (Cache + API Live)...' },
    { name: 'OPPORTUNIST_UPGRADER', desc: "Calcolo opportunità e punteggi dell'agente Opportunista..." },
    { name: 'SYNTHESIZER', desc: 'Assemblaggio finale delle proposte pacchettizzate...' },
  ];

  // Simulation timer for multi-agent visual transitions
  useEffect(() => {
    if (!loading || !apiResult) return;

    const totalSteps = steps.length;
    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex < totalSteps) {
        setCurrentStep(stepIndex);
        
        // Add log lines corresponding to the current agent from the API result
        const agentName = steps[stepIndex].name.replace('_', ' ');
        const matchingLogs = apiResult.logs.filter(log => 
          log.toLowerCase().includes(agentName.toLowerCase()) || 
          (stepIndex === 0 && log.toLowerCase().includes('grafo'))
        );
        
        setVisibleLogs(prev => [...prev, ...matchingLogs]);
        stepIndex++;
      } else {
        clearInterval(interval);
        // Include any remaining system logs
        setVisibleLogs(apiResult.logs);
        setTimeout(() => {
          setLoading(false);
          setShowResults(true);
        }, 600);
      }
    }, 900); // 900ms per agent node step simulation

    return () => clearInterval(interval);
  }, [loading, apiResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowResults(false);
    setCurrentStep(0);
    setVisibleLogs([]);
    setApiResult(null);

    try {
      // Run the Multi-Agent Graph directly in the client browser!
      const { runTravelGraph } = await import('@/lib/agents/graph');
      const finalState = await runTravelGraph({
        rawInput,
        budget: Number(budget),
        flexibility: Number(flexibility),
        departureAirport: departureAirport.toUpperCase().trim(),
        durationDays: Number(durationDays),
        departureDate,
      });

      setApiResult(finalState);
    } catch (err) {
      console.error(err);
      setVisibleLogs([`[ERRORE] Impossibile eseguire il grafo nel browser: ${err instanceof Error ? err.message : String(err)}`]);
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setShowResults(false);
    setApiResult(null);
    setVisibleLogs([]);
    setCurrentStep(0);
  };

  // Helper to style badge based on cardType
  const getBadgeStyles = (cardType: string) => {
    switch (cardType) {
      case 'target':
        return { text: 'Opzione Target', classes: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' };
      case 'smart':
        return { text: 'Opzione Smart', classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' };
      case 'upgrade':
        return { text: 'Opzione Upgrade', classes: 'bg-purple-500/10 text-purple-400 border border-purple-500/30' };
      case 'relax':
        return { text: 'Relax & Benessere', classes: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' };
      case 'culture':
        return { text: 'Cultura & City Break', classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' };
      case 'adventure':
        return { text: 'Avventura & Natura', classes: 'bg-rose-500/10 text-rose-400 border border-rose-500/30' };
      default:
        return { text: 'Proposta AI', classes: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30' };
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-indigo-500/30 relative overflow-hidden">
      
      {/* BACKGROUND MESH GRADIENT */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-600/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-emerald-600/10 blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleRestart}>
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-100 to-indigo-400 bg-clip-text text-transparent">
                TravelGraph
              </span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hidden sm:inline-block">
                Budget-First AI
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-zinc-400 hidden sm:inline-block">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-300"
                >
                  Esci
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-colors text-white"
              >
                <Mail className="h-3.5 w-3.5" />
                Accedi
              </button>
            )}

            {showResults && (
              <button
                id="restartButtonTop"
                onClick={handleRestart}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white backdrop-blur-md"
              >
                <RefreshCw className="h-4 w-4" />
                Nuova Ricerca
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center relative z-10">
        
        {/* UPSell Banner (SaaS PREVIEW) - Nascosto se isPro è true */}
        {!showResults && !loading && !isPro && (
          <div className="max-w-4xl mx-auto w-full mb-6 flex justify-center animate-fade-in">
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-rose-500/10 border border-white/10 rounded-full px-5 py-2 flex items-center gap-3 backdrop-blur-md cursor-pointer hover:border-white/20 transition-all">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-zinc-300">
                Diventa <strong className="text-white">PRO</strong> per 4.99€/mese. Ricerche AI Live illimitate.
              </span>
              <button onClick={handleCheckout} className="text-xs font-bold bg-white text-black px-3 py-1 rounded-full hover:bg-zinc-200 transition-colors ml-2">
                Scopri di più
              </button>
            </div>
          </div>
        )}

        {/* 1. INPUT FORM SCREEN - MAD LIBS STYLE */}
        {!loading && !showResults && (
          <div className="max-w-4xl mx-auto w-full animate-fade-in mt-4">
            
            <form onSubmit={handleSubmit} className="space-y-10 bg-zinc-900/30 p-8 sm:p-12 md:p-16 rounded-[2.5rem] backdrop-blur-2xl border border-white/5 shadow-2xl relative">
              
              {/* MAD LIBS UI */}
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-light leading-[1.6] text-zinc-300 text-center sm:text-left">
                <span className="opacity-80">Voglio partire da</span>
                <input
                  type="text"
                  maxLength={3}
                  value={departureAirport}
                  onChange={(e) => setDepartureAirport(e.target.value.toUpperCase())}
                  className="bg-transparent border-b-2 border-indigo-500/50 hover:border-indigo-400 focus:border-indigo-400 text-white font-bold w-[4ch] text-center focus:outline-none transition-colors mx-2 uppercase placeholder-zinc-700"
                  placeholder="MXP"
                />
                <span className="opacity-80">con un budget totale di</span>
                <span className="whitespace-nowrap">
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="bg-transparent border-b-2 border-emerald-500/50 hover:border-emerald-400 focus:border-emerald-400 text-white font-bold w-[4.5ch] text-center focus:outline-none transition-colors mx-2"
                  />
                  <span className="text-emerald-400 font-bold -ml-1 mr-3">€</span>
                </span>
                <span className="opacity-80">per un viaggio di</span>
                <span className="whitespace-nowrap">
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="bg-transparent border-b-2 border-amber-500/50 hover:border-amber-400 focus:border-amber-400 text-white font-bold w-[3ch] text-center focus:outline-none transition-colors mx-2"
                  />
                  <span className="opacity-80 mr-2">notti,</span>
                </span>
                <span className="opacity-80 block mt-2 sm:mt-0 sm:inline">a partire dal</span>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="bg-transparent border-b-2 border-rose-500/50 hover:border-rose-400 focus:border-rose-400 text-white font-bold w-[180px] sm:w-[220px] text-center focus:outline-none transition-colors mx-2 text-2xl sm:text-3xl md:text-4xl lg:text-[3rem] cursor-pointer mt-2 sm:mt-0"
                />
                <span className="opacity-80 text-indigo-400 font-bold block mt-4">Sorprendimi.</span>
              </div>

              {/* Advanced / Hidden Inputs wrapped nicely */}
              <div className="pt-8 border-t border-white/5 space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="flex-1 w-full relative group">
                    <input
                      type="text"
                      value={rawInput}
                      onChange={(e) => setRawInput(e.target.value)}
                      placeholder="Opzionale: scrivi un desiderio (es. 'Voglio il mare', 'Andiamo in Spagna')"
                      className="w-full px-5 py-4 bg-zinc-950/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-zinc-300 transition-all text-sm placeholder-zinc-600 group-hover:border-white/20"
                    />
                  </div>
                  <div className="w-full sm:w-auto bg-zinc-950/50 border border-white/10 px-5 py-4 rounded-2xl flex items-center justify-between gap-4 group hover:border-white/20 transition-all">
                    <label className="text-sm font-medium text-zinc-400 whitespace-nowrap">
                      Flessibilità Budget: <span className="text-indigo-400 font-bold">±{Math.round(flexibility * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="0.25"
                      step="0.05"
                      value={flexibility}
                      onChange={(e) => setFlexibility(Number(e.target.value))}
                      className="w-20 sm:w-24 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  id="generateButton"
                  type="submit"
                  className="w-full py-5 bg-white text-black hover:bg-zinc-200 font-extrabold text-lg rounded-2xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] active:scale-[0.98] flex items-center justify-center gap-3 group cursor-pointer"
                >
                  <Sparkles className="h-6 w-6 text-indigo-600 group-hover:rotate-12 transition-transform" />
                  Trova Soluzioni Reali
                </button>
              </div>

            </form>
            
            {/* Small helper text below form */}
            <p className="text-center text-zinc-500 text-xs mt-6 flex items-center justify-center gap-2">
              <Compass className="h-3.5 w-3.5" />
              L'AI usa i risultati in memoria per abbattere i costi. Diventa PRO per ricerche Live illimitate.
            </p>
          </div>
        )}

        {/* 2. LOADING STATE & TERMINAL */}
        {loading && (
          <div className="max-w-2xl mx-auto w-full space-y-8">
            <div className="text-center space-y-4">
              {/* Spinner */}
              <div className="relative inline-flex">
                <span className="flex h-16 w-16">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-25"></span>
                  <span className="relative inline-flex rounded-full h-16 w-16 bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Activity className="h-7 w-7 text-white animate-pulse" />
                  </span>
                </span>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">
                  Grafo Multi-Agente Attivo
                </h3>
                <p className="text-indigo-400 text-sm font-medium animate-pulse">
                  {steps[currentStep]?.desc || "Sincronizzazione..."}
                </p>
              </div>
            </div>

            {/* Simulated Live Terminal */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                </div>
                <span className="text-xs font-mono text-zinc-500 select-none">travelgraph-agent-cli</span>
                <Maximize2 className="h-3 w-3 text-zinc-600" />
              </div>
              <div className="p-5 font-mono text-xs sm:text-sm space-y-2 h-72 overflow-y-auto bg-zinc-950/60 text-zinc-300">
                {/* Agent workflow badges */}
                <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-zinc-900">
                  {steps.map((step, idx) => (
                    <span 
                      key={step.name}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        idx < currentStep 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : idx === currentStep
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 animate-pulse'
                          : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                      }`}
                    >
                      {step.name}
                    </span>
                  ))}
                </div>

                {visibleLogs.length === 0 ? (
                  <p className="text-zinc-600 animate-pulse">Connessione al canale agenti...</p>
                ) : (
                  visibleLogs.map((log, index) => {
                    const isError = log.includes("[ERRORE]");
                    const isSystem = log.includes("[Grafo");
                    return (
                      <p 
                        key={index} 
                        className={`leading-relaxed border-l-2 pl-2.5 ${
                          isError 
                            ? 'text-red-400 border-red-500 bg-red-950/10' 
                            : isSystem 
                            ? 'text-indigo-400 border-indigo-500 bg-indigo-950/10' 
                            : 'text-emerald-300 border-emerald-500 bg-emerald-950/5'
                        }`}
                      >
                        <span className="text-zinc-600 mr-1.5 select-none">&gt;</span>
                        {log}
                      </p>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. RESULTS SCREEN */}
        {!loading && showResults && apiResult && (
          <div className="space-y-12 animate-fade-in mt-6">
            
            {/* Header info */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-zinc-300 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Missione Compiuta
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Ecco le opzioni per te.
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                {apiResult.userPreferences.isBlindExploration 
                  ? `Tre destinazioni inaspettate da ${getAirportName(apiResult.userPreferences.departureAirport) || apiResult.userPreferences.departureAirport} sotto i ${apiResult.userPreferences.budget}€.`
                  : `Viaggio per "${apiResult.userPreferences.rawInput}" da ${getAirportName(apiResult.userPreferences.departureAirport) || apiResult.userPreferences.departureAirport} sotto i ${apiResult.userPreferences.budget}€.`}
              </p>
            </div>

            {/* Grid layout containing exactly 3 cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {apiResult.finalProposals.map((proposal, index) => {
                const badge = getBadgeStyles(proposal.cardType);
                return (
                  <article 
                    key={index} 
                    className="bg-zinc-900/40 border border-white/5 rounded-[2rem] flex flex-col justify-between hover:border-white/20 transition-all hover:-translate-y-1 overflow-hidden group shadow-2xl backdrop-blur-xl relative"
                  >
                    
                    {/* Glowing effect inside card */}
                    <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/10 to-purple-500/0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="p-8 space-y-6 relative z-10">
                      
                      {/* Badge and Destination */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full tracking-wider uppercase ${badge.classes}`}>
                          {badge.text}
                        </span>
                      </div>

                      {/* Title & Dest */}
                      <div>
                        <div className="flex items-center gap-1.5 text-zinc-400 text-sm mb-2 font-medium">
                          <MapPin className="h-4 w-4" />
                          {proposal.destination}
                        </div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors leading-tight">
                          {proposal.title}
                        </h3>
                      </div>

                      {/* Total Price */}
                      <div className="pt-4 pb-4 border-b border-white/5 flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tight text-white">
                          {proposal.totalPrice} <span className="text-3xl text-zinc-500 font-medium">€</span>
                        </span>
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                          Tutto compreso
                        </span>
                      </div>

                      {/* Flight & Hotel Details list */}
                      <ul className="space-y-4">
                        
                        {/* Flight Item */}
                        <li className="flex gap-4 text-sm text-zinc-300 items-start">
                          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 mt-0.5">
                            <Plane className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block font-bold text-zinc-100 text-sm">Volo A/R</span>
                            <span className="text-zinc-400 text-xs leading-relaxed">{proposal.flightDetails}</span>
                          </div>
                        </li>

                        {/* Hotel Item (BLURRED IF NOT LOGGED IN) */}
                        <li className="flex gap-4 text-sm text-zinc-300 items-start">
                          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 mt-0.5">
                            <Hotel className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <span className="block font-bold text-zinc-100 text-sm">Alloggio ({apiResult.userPreferences.durationDays} notti)</span>
                            {user && isPro ? (
                              <span className="text-zinc-400 text-xs leading-relaxed">{proposal.hotelDetails}</span>
                            ) : (
                              <div className="relative mt-1 group-hover:opacity-100 opacity-90 transition-opacity">
                                <span className="text-zinc-500 text-xs leading-relaxed blur-[4px] select-none block">
                                  Hotel 4 stelle in pieno centro con colazione inclusa e ottime recensioni su Booking.
                                </span>
                                <div className="absolute inset-0 flex items-center justify-start">
                                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 bg-zinc-950/90 px-2.5 py-1 rounded-md border border-amber-500/30">
                                    <Lock className="h-3 w-3" /> Nascosto (Diventa PRO)
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </li>

                      </ul>

                    </div>

                    {/* Why choose it block & Book Button */}
                    <div className="p-8 bg-zinc-950/60 border-t border-white/5 relative z-10 flex flex-col justify-between gap-5">
                      <div>
                        <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                          L'intuizione dell'AI
                        </span>
                        <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                          {proposal.whyChooseIt}
                        </p>
                      </div>
                      
                      {user && isPro ? (
                        <button
                          onClick={() => setSelectedProposalForBooking(proposal)}
                          className="w-full py-3.5 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                        >
                          Vedi Prezzi Reali & Prenota
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={user ? handleCheckout : handleLogin}
                          className="w-full py-3.5 bg-indigo-600 text-white hover:bg-indigo-500 font-bold rounded-xl text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                        >
                          {user ? <Crown className="h-4 w-4 text-amber-400" /> : <Mail className="h-4 w-4" />}
                          {user ? "Diventa PRO per sbloccare" : "Accedi per iniziare"}
                        </button>
                      )}
                    </div>

                  </article>
                );
              })}
            </div>

          </div>
        )}

        {/* Booking Details Modal (Only reachable if User is Logged In, but we double check) */}
        {selectedProposalForBooking && user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-scale-up">
              
              {/* Modal Header */}
              <div className="bg-zinc-950/80 px-8 py-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                    {getBadgeStyles(selectedProposalForBooking.cardType).text}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-3">
                    Conferma i Prezzi Reali
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProposalForBooking(null)}
                  className="text-zinc-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8">
                
                {/* Destination & Price Overview */}
                <div className="bg-zinc-950/50 border border-white/5 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-500 font-bold tracking-widest block mb-1">DESTINAZIONE</span>
                    <span className="text-xl font-bold text-white flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-zinc-400" />
                      {selectedProposalForBooking.destination}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 font-bold tracking-widest block mb-1">STIMA BUDGET</span>
                    <span className="text-3xl font-black text-emerald-400">
                      {selectedProposalForBooking.totalPrice} €
                    </span>
                  </div>
                </div>

                {/* Booking Steps */}
                <div className="space-y-6">
                  
                  {/* Step 1: Volo */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-base font-bold text-zinc-200">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 text-sm text-indigo-400 font-mono">
                        1
                      </div>
                      Blocca il Volo su Skyscanner
                    </div>
                    <div className="pl-11 space-y-3">
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {apiResult?.userPreferences.isRoadTrip ? (
                          <span className="text-amber-400 font-semibold block">
                            Nessun volo necessario. Usa questo budget per il carburante o noleggia un'auto.
                          </span>
                        ) : (
                          <>
                            Itinerario aereo suggerito: <strong className="text-zinc-200">{selectedProposalForBooking.flightDetails}</strong>.
                          </>
                        )}
                      </p>
                      {!apiResult?.userPreferences.isRoadTrip && (
                        <a
                          href={getSkyscannerUrl(
                            apiResult?.userPreferences.departureAirport || "MXP", 
                            selectedProposalForBooking.destination,
                            apiResult?.userPreferences.departureDate || "",
                            apiResult?.userPreferences.durationDays || 7
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 bg-[#0770e3] hover:bg-[#065ebf] text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-[#0770e3]/20"
                        >
                          <Plane className="h-4 w-4" />
                          Vedi Prezzi su Skyscanner
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Alloggio */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 text-base font-bold text-zinc-200">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-sm text-emerald-400 font-mono">
                        2
                      </div>
                      Prenota l'Alloggio su Booking.com
                    </div>
                    <div className="pl-11 space-y-3">
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        Struttura di riferimento: <strong className="text-zinc-200">{selectedProposalForBooking.hotelDetails}</strong>. 
                      </p>
                      <a
                        href={getBookingUrl(
                          selectedProposalForBooking.destination,
                          apiResult?.userPreferences.departureDate || "",
                          apiResult?.userPreferences.durationDays || 7
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-[#003580] hover:bg-[#00224f] text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-[#003580]/20"
                      >
                        <Hotel className="h-4 w-4" />
                        Vedi Disponibilità su Booking.com
                      </a>
                    </div>
                  </div>

                  {/* Step 3: Esperienze (Upsell) */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 text-base font-bold text-zinc-200">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 border border-rose-500/30 text-sm text-rose-400 font-mono">
                        3
                      </div>
                      Migliora il Viaggio (Opzionale)
                    </div>
                    <div className="pl-11 space-y-3">
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        Cerca tour, salta-fila ed esperienze uniche su GetYourGuide.
                      </p>
                      <a
                        href={getGygUrl(selectedProposalForBooking.destination)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-[#ff5533] hover:bg-[#cc4429] text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-[#ff5533]/20"
                      >
                        <Compass className="h-4 w-4" />
                        Scopri Esperienze (GetYourGuide)
                      </a>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-zinc-950 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-zinc-500 font-medium">
          <p>© {new Date().getFullYear()} TravelGraph. Il primo motore di ricerca viaggi "Budget-First".</p>
        </div>
      </footer>

    </div>
  );
}
