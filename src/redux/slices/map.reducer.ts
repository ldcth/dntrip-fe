import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store/store"; // Correct path to the existing store config

interface Coords {
  lat: number;
  lng: number;
}

interface PlanLocation extends Coords {
  name: string;
  type: "hotel" | "place" | "restaurant";
  day?: number;
}

interface MapState {
  selectedLocation: Coords | null; // For highlighting single point
  routeRequest: { origin: Coords; destination: Coords } | null; // For directions request
  planLocations: PlanLocation[]; // For showing all plan locations
  selectedPlanLocation: PlanLocation | null; // For highlighting a specific plan location
}

const initialState: MapState = {
  selectedLocation: null,
  routeRequest: null,
  planLocations: [],
  selectedPlanLocation: null,
};

export const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    // Action to set a single highlighted location (toggle OFF)
    setSelectedLocation: (state, action: PayloadAction<Coords | null>) => {
      state.selectedLocation = action.payload;
      state.routeRequest = null; // Clear any active route request
    },
    // Action to request a route between two points (toggle ON)
    setRouteRequest: (
      state,
      action: PayloadAction<{ origin: Coords; destination: Coords } | null>
    ) => {
      state.routeRequest = action.payload;
      state.selectedLocation = null; // Clear any single highlighted location
    },
    // Action to set all plan locations
    setPlanLocations: (state, action: PayloadAction<PlanLocation[]>) => {
      state.planLocations = action.payload;
    },
    // Action to select a specific plan location
    setSelectedPlanLocation: (
      state,
      action: PayloadAction<PlanLocation | null>
    ) => {
      state.selectedPlanLocation = action.payload;
      // Don't clear other states - keep them independent
    },
    // Action to clear everything
    clearMapState: (state) => {
      state.selectedLocation = null;
      state.routeRequest = null;
      state.planLocations = [];
      state.selectedPlanLocation = null;
    },
  },
});

export const {
  setSelectedLocation,
  setRouteRequest,
  setPlanLocations,
  setSelectedPlanLocation,
  clearMapState,
} = mapSlice.actions;

// Selectors
export const selectCurrentSelectedLocation = (state: RootState) =>
  state.map?.selectedLocation;
export const selectCurrentRouteRequest = (state: RootState) =>
  state.map?.routeRequest;
export const selectPlanLocations = (state: RootState) =>
  state.map?.planLocations;
export const selectSelectedPlanLocation = (state: RootState) =>
  state.map?.selectedPlanLocation;

export default mapSlice.reducer;
