import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store/store"; // Correct path to the existing store config

interface Coords {
  lat: number;
  lng: number;
}

interface MapState {
  selectedLocation: Coords | null; // For highlighting single point
  routeRequest: { origin: Coords; destination: Coords } | null; // For directions request
}

const initialState: MapState = {
  selectedLocation: null,
  routeRequest: null,
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
    // Action to clear everything
    clearMapState: (state) => {
      state.selectedLocation = null;
      state.routeRequest = null;
    },
  },
});

export const { setSelectedLocation, setRouteRequest, clearMapState } =
  mapSlice.actions;

// Selectors
export const selectCurrentSelectedLocation = (state: RootState) =>
  state.map?.selectedLocation;
export const selectCurrentRouteRequest = (state: RootState) =>
  state.map?.routeRequest;

export default mapSlice.reducer;
