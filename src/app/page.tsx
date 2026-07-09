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
  Maximize2
} from 'lucide-react';
import { TravelGraphState } from '@/lib/agents/state';

export default function TravelGraphHome() {
  // Input Form State
  const [rawInput, setRawInput] = useState('');
  const [budget, setBudget] = useState(600);
  const [flexibility, setFlexibility] = useState(0.15);
  const [departureAirport, setDepartureAirport] = useState('MXP');
  const [durationDays, setDurationDays] = useState(7);

  // Flow State
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [apiResult, setApiResult] = useState<TravelGraphState | null>(null);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedProposalForBooking, setSelectedProposalForBooking] = useState<any | null>(null);

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

  const getSkyscannerUrl = (dep: string, destName: string) => {
    const destCode = DEST_CODES[destName] || "HER";
    return `https://www.skyscanner.it/trasporti/voli/${dep.toLowerCase()}/${destCode.toLowerCase()}/`;
  };

  const getBookingUrl = (destName: string) => {
    return `https://www.booking.com/searchresults.it.html?ss=${encodeURIComponent(destName)}`;
  };

  // Agent Steps Definition
  const steps = [
    { name: 'ROUTER_PARSER', desc: "Analisi dell'input e classificazione dell'esplorazione..." },
    { name: 'GEO_EXPLORER', desc: 'Ricerca delle mete target e delle alternative look-alike...' },
    { name: 'DATA_FETCHER', desc: 'Recupero tariffe voli e hotel (Firestore + Fallback)...' },
    { name: 'OPPORTUNIST_UPGRADER', desc: "Calcolo opportunità e punteggi dell'agente Opportunista..." },
    { name: 'SYNTHESIZER', desc: 'Assemblaggio finale delle 3 proposte pacchettizzate...' },
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-indigo-500/30">
      
      {/* HEADER */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-100 to-indigo-400 bg-clip-text text-transparent">
                TravelGraph
              </span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400">
                Multi-Agent AI
              </span>
            </div>
          </div>
          
          {showResults && (
            <button
              id="restartButtonTop"
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Nuova Ricerca
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center">
        
        {/* 1. INPUT FORM SCREEN */}
        {!loading && !showResults && (
          <div className="max-w-3xl mx-auto w-full">
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
                Pianifica il viaggio in <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">3 sole mosse</span>
              </h1>
              <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto">
                Inserisci la tua idea o lascia fare all'esplorazione al buio. Il nostro grafo di agenti intelligenti farà tutto il lavoro per te.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/40 border border-zinc-900 p-6 sm:p-8 rounded-2xl backdrop-blur-xl">
              
              {/* Textarea Input */}
              <div className="space-y-2">
                <label htmlFor="rawInput" className="block text-sm font-medium text-zinc-300">
                  Qual è il tuo mood o la tua meta?
                </label>
                <textarea
                  id="rawInput"
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Esempio: 'Voglio fare una settimana di mare a Creta' oppure scrivi solo quando vuoi partire se sei indeciso..."
                  className="w-full h-32 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-zinc-200 placeholder-zinc-600 transition-all resize-none text-base"
                />
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Budget Slider */}
                <div className="space-y-2 bg-zinc-950/50 border border-zinc-900 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label htmlFor="budgetSlider" className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                      Budget Massimo
                    </label>
                    <span className="text-sm font-bold text-emerald-400">
                      {budget} €
                    </span>
                  </div>
                  <input
                    id="budgetSlider"
                    type="range"
                    min="200"
                    max="3000"
                    step="50"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>200€</span>
                    <span>3000€</span>
                  </div>
                </div>

                {/* Flexibility Slider */}
                <div className="space-y-2 bg-zinc-950/50 border border-zinc-900 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label htmlFor="flexibilitySlider" className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                      <Sliders className="h-4 w-4 text-indigo-400" />
                      Flessibilità Budget
                    </label>
                    <span className="text-sm font-bold text-indigo-400">
                      {Math.round(flexibility * 100)}% (+{(budget * flexibility).toFixed(0)}€)
                    </span>
                  </div>
                  <input
                    id="flexibilitySlider"
                    type="range"
                    min="0"
                    max="0.25"
                    step="0.05"
                    value={flexibility}
                    onChange={(e) => setFlexibility(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>0% (Fisso)</span>
                    <span>25% (Consigliato)</span>
                  </div>
                </div>

              </div>

              {/* Text Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Departure Airport */}
                <div className="space-y-2">
                  <label htmlFor="departureAirportInput" className="block text-sm font-medium text-zinc-300 flex items-center justify-between">
                    <span>Aeroporto di Partenza</span>
                    {getAirportName(departureAirport) ? (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {getAirportName(departureAirport)}
                      </span>
                    ) : departureAirport.trim().length === 3 ? (
                      <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Aeroporto Generico ({departureAirport})
                      </span>
                    ) : null}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 text-sm font-semibold">
                      DEP
                    </span>
                    <input
                      id="departureAirportInput"
                      type="text"
                      maxLength={3}
                      value={departureAirport}
                      onChange={(e) => setDepartureAirport(e.target.value.toUpperCase())}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-zinc-200 font-mono tracking-wider transition-all"
                    />
                  </div>
                </div>

                {/* Duration Days */}
                <div className="space-y-2">
                  <label htmlFor="durationDaysInput" className="block text-sm font-medium text-zinc-300">
                    Durata Viaggio (Notti)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 text-sm font-semibold">
                      QTY
                    </span>
                    <input
                      id="durationDaysInput"
                      type="number"
                      min={3}
                      max={21}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-zinc-200 transition-all"
                    />
                  </div>
                </div>

              </div>

              {/* Supported Destinations Panel */}
              <div className="bg-zinc-950/50 border border-zinc-900 p-4 rounded-xl space-y-2 text-xs text-zinc-400">
                <h4 className="font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-indigo-400 animate-spin-slow" />
                  Destinazioni Supportate nel Database
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                  <div>
                    <span className="font-semibold text-zinc-200">Volo:</span> Creta, Rodi, Ibiza, Maiorca, Parigi, Lione, Londra, Manchester, Roma, Napoli, Maldive, Zanzibar, Tenerife, Reykjavik.
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-200">Road Trip (Auto):</span> Sicilia (Taormina, Siracusa, Avola). Scrivi "Sicilia" o "Vicino Catania" per attivare questa modalità.
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="generateButton"
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Sparkles className="h-5 w-5 text-indigo-200 group-hover:animate-pulse" />
                Genera Proposte con TravelGraph
              </button>

            </form>
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
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
          <div className="space-y-8 animate-fade-in">
            
            {/* Header info */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-white">
                Le tue 3 Opzioni Personalizzate
              </h2>
              <p className="text-zinc-400 text-base max-w-xl mx-auto">
                {apiResult.userPreferences.isBlindExploration 
                  ? `Esplorazione al buio da ${apiResult.userPreferences.departureAirport} • Budget ${apiResult.userPreferences.budget}€`
                  : `Viaggio per "${apiResult.userPreferences.rawInput}" da ${apiResult.userPreferences.departureAirport} • Budget ${apiResult.userPreferences.budget}€`}
              </p>
            </div>

            {/* Grid layout containing exactly 3 cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {apiResult.finalProposals.map((proposal, index) => {
                const badge = getBadgeStyles(proposal.cardType);
                return (
                  <article 
                    key={index} 
                    className="bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all hover:translate-y-[-4px] overflow-hidden group shadow-xl relative"
                  >
                    
                    {/* Glowing effect inside card */}
                    <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/10 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="p-6 sm:p-8 space-y-6 relative z-10">
                      
                      {/* Badge and Destination */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full tracking-wide ${badge.classes}`}>
                          {badge.text}
                        </span>
                        <div className="flex items-center gap-1 text-zinc-500 text-sm">
                          <MapPin className="h-4 w-4 text-zinc-500" />
                          {proposal.destination}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {proposal.title}
                      </h3>

                      {/* Total Price */}
                      <div className="pt-2 pb-4 border-b border-zinc-900 flex items-baseline gap-2">
                        <span className="text-4xl font-black tracking-tight text-white">
                          {proposal.totalPrice} €
                        </span>
                        <span className="text-zinc-500 text-xs font-semibold uppercase">
                          Tutto compreso
                        </span>
                      </div>

                      {/* Flight & Hotel Details list */}
                      <ul className="space-y-3.5">
                        
                        {/* Flight Item */}
                        <li className="flex gap-3 text-sm text-zinc-300 items-start">
                          <div className="p-1 bg-zinc-950 border border-zinc-800 rounded-md text-indigo-400 mt-0.5">
                            <Plane className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="block font-semibold text-zinc-200">Volo</span>
                            <span className="text-zinc-400">{proposal.flightDetails}</span>
                          </div>
                        </li>

                        {/* Hotel Item */}
                        <li className="flex gap-3 text-sm text-zinc-300 items-start">
                          <div className="p-1 bg-zinc-950 border border-zinc-800 rounded-md text-emerald-400 mt-0.5">
                            <Hotel className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="block font-semibold text-zinc-200">Alloggio</span>
                            <span className="text-zinc-400">{proposal.hotelDetails}</span>
                          </div>
                        </li>

                      </ul>

                    </div>

                    {/* Why choose it block & Book Button */}
                    <div className="p-6 bg-zinc-950/60 border-t border-zinc-900 relative z-10 flex flex-col justify-between min-h-[170px] gap-4">
                      <div>
                        <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-indigo-400" />
                          Perché sceglierlo
                        </span>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                          {proposal.whyChooseIt}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedProposalForBooking(proposal)}
                        className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/30 border border-indigo-500/20 text-indigo-300 font-semibold rounded-lg text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        Prenota & Dettagli Reali
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </article>
                );
              })}
            </div>

            {/* Restart Button Center */}
            <div className="pt-8 text-center">
              <button
                id="restartButtonCenter"
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-all font-semibold text-zinc-300 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Riavvia Ricerca
              </button>
            </div>

          </div>
        )}

        {/* Booking Details Modal */}
        {selectedProposalForBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
              
              {/* Modal Header */}
              <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    {getBadgeStyles(selectedProposalForBooking.cardType).text}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1.5">
                    Dettagli Prenotazione Reale
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProposalForBooking(null)}
                  className="text-zinc-500 hover:text-white transition-colors p-1"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                
                {/* Destination & Price Overview */}
                <div className="bg-zinc-950/50 border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-500 font-semibold block">DESTINAZIONE</span>
                    <span className="text-lg font-bold text-white flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      {selectedProposalForBooking.destination}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 font-semibold block">PREZZO STIMATO</span>
                    <span className="text-2xl font-black text-emerald-400">
                      {selectedProposalForBooking.totalPrice} €
                    </span>
                  </div>
                </div>

                {/* Booking Steps */}
                <div className="space-y-4">
                  
                  {/* Step 1: Volo */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-mono">
                        1
                      </div>
                      Prenota il Volo su Skyscanner
                    </div>
                    <div className="pl-8 space-y-2.5">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {apiResult?.userPreferences.isRoadTrip ? (
                          <span className="text-amber-400 font-semibold block">
                            Nessun volo aereo necessario! Raggiungi la destinazione in auto o noleggia un veicolo (i costi di carburante e pedaggi sono stimati nel prezzo finale).
                          </span>
                        ) : (
                          <>
                            Abbiamo selezionato per te l'itinerario aereo: <strong className="text-zinc-200">{selectedProposalForBooking.flightDetails}</strong>. 
                            Clicca sotto per verificare i prezzi in tempo reale ed acquistare il volo.
                          </>
                        )}
                      </p>
                      {!apiResult?.userPreferences.isRoadTrip && (
                        <a
                          href={getSkyscannerUrl(apiResult?.userPreferences.departureAirport || "MXP", selectedProposalForBooking.destination)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          <Plane className="h-3.5 w-3.5" />
                          Cerca Volo su Skyscanner.it
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Alloggio */}
                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono">
                        2
                      </div>
                      Prenota l'Alloggio su Booking.com
                    </div>
                    <div className="pl-8 space-y-2.5">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Struttura selezionata dallo storico tariffe: <strong className="text-zinc-200">{selectedProposalForBooking.hotelDetails}</strong>. 
                        Clicca sotto per visualizzare le camere disponibili in tempo reale per le tue date.
                      </p>
                      <a
                        href={getBookingUrl(selectedProposalForBooking.destination)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        <Hotel className="h-3.5 w-3.5" />
                        Cerca Struttura su Booking.com
                      </a>
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-zinc-950 px-6 py-4 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={() => setSelectedProposalForBooking(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer border border-zinc-800"
                >
                  Chiudi Dettagli
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} TravelGraph. Sviluppato con Next.js, Tailwind CSS e LangGraph multi-agente.</p>
        </div>
      </footer>

    </div>
  );
}
