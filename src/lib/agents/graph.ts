import { createInitialState, TravelGraphState } from "./state";
import { 
  routerParserNode, 
  geoExplorerNode, 
  dataFetcherNode, 
  itineraryArchitectNode, 
  bookingAgentNode 
} from "./agents";

/**
 * Stateful Multi-Agent Graph Runner.
 * Simulates a sequential flow through LangGraph-like nodes.
 * Takes the user parameters and returns the final calculated TravelGraphState.
 */
export async function runTravelGraph(
  params: Partial<TravelGraphState['userPreferences']>
): Promise<TravelGraphState> {
  // Initialize state
  let state = createInitialState(params);
  state.logs.push("[Grafo Multi-Agente] Avvio del processo di pianificazione TravelGraph...");

  try {
    // 1. ROUTER_PARSER
    const stateUpdate1 = await routerParserNode(state);
    state = { ...state, ...stateUpdate1 };

    // 2. GEO_EXPLORER
    const stateUpdate2 = await geoExplorerNode(state);
    state = { ...state, ...stateUpdate2 };

    // 3. DATA_FETCHER
    const stateUpdate3 = await dataFetcherNode(state);
    state = { ...state, ...stateUpdate3 };

    // 4. ITINERARY_ARCHITECT
    const stateUpdate4 = await itineraryArchitectNode(state);
    state = { ...state, ...stateUpdate4 };

    // 5. BOOKING_AGENT
    const stateUpdate5 = await bookingAgentNode(state);
    state = { ...state, ...stateUpdate5 };

    state.logs.push("[Grafo Multi-Agente] Organizzazione conclusa con successo!");
  } catch (error) {
    console.error("Graph Execution Error: ", error);
    state.logs.push(`[ERRORE DI SISTEMA] Si è verificato un errore durante l'esecuzione del grafo: ${error instanceof Error ? error.message : String(error)}`);
  }

  return state;
}
