export interface ProgressEvent {
  type: "connected" | "progress" | "error" | "completed";
  thread_id: string;
  phase?: string;
  message?: string;
  timestamp?: string;
  tool_name?: string;
  is_loading?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ProgressState {
  phase: string | null;
  message: string;
  isLoading: boolean;
  tool_name: string | null;
  timestamp: string | null;
  isConnected: boolean;
  error: string | null;
}

export interface SSEHookOptions {
  enabled?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface ProgressIndicatorProps {
  progress: ProgressState;
  className?: string;
  showTimestamp?: boolean;
  useRawMessages?: boolean;
}

export interface SpinnerProps {
  type?: "ai-spinner" | "tool-spinner" | "default";
  size?: "small" | "medium" | "large";
  className?: string;
}

export const PROGRESS_MESSAGES = {
  initial_router: "🔍 Understanding your request...",
  relevance_checker: "✅ Validating travel query...",
  intent_router: "🎯 Determining best approach...",
  call_llm_with_tools: "🤖 AI is analyzing...",
  action_flight_tool: "✈️ Searching flights...",
  action_planner_tool: "📝 Creating itinerary...",
  action_rag_tool: "📍 Finding places...",
  action_tavily_search: "🔍 Gathering information...",
  clarification_node: "❓ Need more details...",
  retrieve_stored_information: "💾 Retrieving saved info...",
  direct_llm_answer: "💬 Preparing response...",
  completed: "✅ Done!",

  show_flights: "✈️ Searching flights...",
  plan_da_nang_trip: "📝 Creating itinerary...",
  search_places_rag_tool: "📍 Finding places...",
  search_places_rag: "📍 Finding places...",
  tavily_search: "🔍 Gathering information...",
  tavily_search_results_json: "🔍 Gathering information...",
  select_flight_tool: "✅ Selecting flight...",
} as const;
