export interface IConversation {
  _id: string;
  contents: IContent[];
  createdAt: string;
  title: string;
  updatedAt: string;
  userId: string;
  threadId: string;
}

export interface IContent {
  _id: string;
  conversationId: string;
  threadId: string;
  content: string | AiResponseType;
  type: "Human" | "AI";
  intent: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockLocation {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export interface RawFlightDataFromAPI {
  flight_id?: string;
  departure_time?: string;
  arrival_time?: string;
  flight_time?: string;
  price?: string;
  date?: string;
  departure_airport?: string;
  arrival_airport?: string;
}

export interface HotelLocation {
  name: string;
  coords: [number, number];
  description?: string;
  price_per_night?: string;
  check_in_date?: string;
  check_out_date?: string;
}

export interface PlannedStops {
  Morning?: string[];
  Lunch?: string[];
  Afternoon?: string[];
  Dinner?: string[];
  Evening?: string[];
}

export interface RouteStep {
  step: number;
  time_slot: string;
  type: "hotel" | "place" | "restaurant";
  name: string;
  coords: [number, number];
  distance_from_previous_km: number;
  description?: string;
}

export interface DailyPlan {
  day: number;
  planned_stops: PlannedStops;
  route: RouteStep[];
  activities?: Array<{
    time?: string;
    description?: string;
    location?: { name?: string; coordinates?: { lat?: number; lng?: number } };
  }>;
}

export interface StructuredPlan {
  hotel: HotelLocation;
  daily_plans: DailyPlan[];
  summary?: string;
  total_days?: number;
  destination?: string;
}

export interface PlanAgentPayload {
  base_plan: StructuredPlan;
  notes?: string[];
  travel_duration_requested?: string;
  user_specified_stops?: unknown[];
}

export interface AiResponseType {
  message?: string;
  flights?: RawFlightDataFromAPI[];
  plan_details?: StructuredPlan | PlanAgentPayload;
  locations?: MockLocation[];
  selected_flight_details?: RawFlightDataFromAPI;
  confirmed_flight_details?: RawFlightDataFromAPI;
}
