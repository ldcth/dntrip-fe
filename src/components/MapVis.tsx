import React, { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store/store";
import {
  selectCurrentSelectedLocation,
  selectCurrentRouteRequest,
  selectPlanLocations,
  selectSelectedPlanLocation,
  setSelectedPlanLocation,
  clearMapState,
} from "@/redux/slices/map.reducer";

const mapContainerStyle = {
  width: "100%",
  flexGrow: 1,
  position: "relative" as const,
};

const controlsContainerStyle = {
  padding: "10px 15px",
  display: "flex",
  gap: "20px",
  alignItems: "center",
  borderTop: "1px solid #dee2e6",
  background: "#ffffff",
  color: "#212529",
};

const labelStyle = {
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  color: "#495057",
  fontSize: "0.9rem",
};

const buttonStyle = {
  padding: "6px 18px",
  cursor: "pointer",
  border: "1px solid #0d6efd",
  backgroundColor: "#0d6efd",
  color: "#ffffff",
  borderRadius: "4px",
  fontSize: "0.9rem",
  transition: "background-color 0.2s ease",
};

const buttonDisabledStyle = {
  ...buttonStyle,
  backgroundColor: "#6c757d",
  borderColor: "#6c757d",
  cursor: "not-allowed",
  opacity: 0.65,
};

interface AppMapVisProps {
  showDirectionsMode: boolean;
  setShowDirectionsMode?: (value: boolean) => void;
  threadId: string | null;
}

const defaultCenter = {
  lat: 16.0612266,
  lng: 108.2271015,
};
const defaultZoom = 15;

const AppMapVis = ({
  showDirectionsMode,
  setShowDirectionsMode,
  threadId,
}: AppMapVisProps) => {
  const mapInstance = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const dispatch = useDispatch<AppDispatch>();

  const selectedLocation = useSelector(selectCurrentSelectedLocation);
  const routeRequest = useSelector(selectCurrentRouteRequest);
  const planLocations = useSelector(selectPlanLocations);
  const selectedPlanLocation = useSelector(selectSelectedPlanLocation);

  const [directionsService, setDirectionsService] = useState<
    google.maps.DirectionsService | undefined
  >();
  const [directionsRenderer, setDirectionsRenderer] = useState<
    google.maps.DirectionsRenderer | undefined
  >();
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);
  const [highlightedMarker, setHighlightedMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!routesLibrary || !mapInstance) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(
      new routesLibrary.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: "#1a73e8",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      })
    );
    return () => {
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    };
  }, [routesLibrary, mapInstance]);

  useEffect(() => {
    if (
      selectedLocation &&
      typeof selectedLocation.lat === "number" &&
      typeof selectedLocation.lng === "number" &&
      mapInstance
    ) {
      console.log("MapVis: Highlighting location:", selectedLocation);
      mapInstance.panTo(selectedLocation);
      setHighlightedMarker(selectedLocation);
      if (directionsRenderer) {
        console.log("MapVis (Highlight): Clearing directions renderer.");
        directionsRenderer.setDirections(null);
      } else {
        console.warn(
          "MapVis (Highlight): Tried to clear directions, but renderer not ready."
        );
      }
      setDirectionsResponse(null);
    } else {
      setHighlightedMarker(null);
    }
  }, [selectedLocation, mapInstance, directionsRenderer]);

  useEffect(() => {
    console.log("MapVis: routeRequest Effect triggered. Value:", routeRequest);

    if (!directionsService || !directionsRenderer || !mapInstance) {
      console.log(
        "MapVis: routeRequest Effect - service, renderer, or mapInstance not ready."
      );
      return;
    }

    if (
      routeRequest &&
      routeRequest.origin &&
      typeof routeRequest.origin.lat === "number" &&
      typeof routeRequest.origin.lng === "number" &&
      routeRequest.destination &&
      typeof routeRequest.destination.lat === "number" &&
      typeof routeRequest.destination.lng === "number"
    ) {
      console.log(
        "MapVis: routeRequest is valid. Calling directionsService.route..."
      );
      setHighlightedMarker(null);
      directionsService
        .route({
          origin: routeRequest.origin,
          destination: routeRequest.destination,
          travelMode: google.maps.TravelMode.DRIVING,
        })
        .then((response) => {
          console.log(
            "MapVis: directionsService.route successful. Response:",
            response
          );
          directionsRenderer.setDirections(response);
          setDirectionsResponse(response);

          console.log(
            "MapVis: Panning to destination:",
            routeRequest.destination
          );
          mapInstance.panTo(routeRequest.destination);
          mapInstance.setZoom(16);
        })
        .catch((e) => {
          console.error("MapVis: directionsService.route failed:", e);
          directionsRenderer.setDirections(null);
          setDirectionsResponse(null);
        });
    } else if (directionsRenderer?.hasOwnProperty("directions")) {
      console.log("Destination is null, clearing directions via effect...");
      if (directionsRenderer) {
        console.log(
          "Renderer instance in effect before clearing:",
          directionsRenderer
        );
        try {
          console.log(
            "Effect: Attempting directionsRenderer.setDirections(null)"
          );
          directionsRenderer.setDirections({
            request: {
              destination: {},
              origin: {},
              travelMode: google.maps.TravelMode.DRIVING,
            },
            routes: [],
          });
          console.log("Effect: Successfully called setDirections(null).");
          setDirectionsResponse(null);
        } catch (error) {
          console.error("Effect Error calling setDirections(null):", error);
          setDirectionsResponse(null);
        }
      } else {
        console.log("Renderer not available in effect when trying to clear.");
        setDirectionsResponse(null);
      }
    }
  }, [routeRequest, directionsService, directionsRenderer, mapInstance]);

  useEffect(() => {
    if (threadId) {
      console.log(
        "MapVis: New threadId detected, resetting map state.",
        threadId
      );
      dispatch(clearMapState());

      if (directionsRenderer) {
        directionsRenderer.setDirections(null);
      }
      setDirectionsResponse(null);
      setHighlightedMarker(null);

      if (mapInstance) {
        console.log("MapVis: Panning to default center for new chat.");
        mapInstance.panTo(defaultCenter);
        mapInstance.setZoom(defaultZoom);
      }
    }
  }, [threadId, dispatch, mapInstance, directionsRenderer]);

  const handleClearPath = () => {
    console.log("MapVis: Clear Path button clicked");
    dispatch(clearMapState());
    if (mapInstance) {
      console.log("MapVis: Resetting map view to default.");
      mapInstance.panTo(defaultCenter);
      mapInstance.setZoom(15);
    } else {
      console.warn("MapVis: mapInstance not available to reset view.");
    }
  };

  const isRouteActive = !!routeRequest;

  useEffect(() => {
    if (
      mapInstance &&
      planLocations &&
      planLocations.length > 0 &&
      !isRouteActive &&
      !highlightedMarker
    ) {
      console.log(
        "MapVis: Fitting map bounds to plan locations:",
        planLocations
      );
      const bounds = new google.maps.LatLngBounds();
      planLocations.forEach((location) => {
        bounds.extend({ lat: location.lat, lng: location.lng });
      });
      mapInstance.fitBounds(bounds);

      // Ensure minimum zoom level
      const listener = mapInstance.addListener("bounds_changed", () => {
        if (mapInstance.getZoom() && mapInstance.getZoom()! > 16) {
          mapInstance.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [planLocations, mapInstance, isRouteActive, highlightedMarker]);

  // Clear selected plan location when no plan locations exist
  useEffect(() => {
    if (
      selectedPlanLocation &&
      (!planLocations || planLocations.length === 0)
    ) {
      console.log("MapVis: No plan locations, clearing selected plan location");
      dispatch(setSelectedPlanLocation(null));
    }
  }, [planLocations, selectedPlanLocation, dispatch]);

  // Zoom into selected plan location
  useEffect(() => {
    if (mapInstance && selectedPlanLocation) {
      console.log(
        "MapVis: Zooming into selected plan location:",
        selectedPlanLocation
      );
      console.log("MapVis: mapInstance available:", !!mapInstance);

      const targetLocation = {
        lat: selectedPlanLocation.lat,
        lng: selectedPlanLocation.lng,
      };

      // Pan to the location smoothly first
      mapInstance.panTo(targetLocation);

      // Add a small delay to ensure pan completes before zoom
      setTimeout(() => {
        const currentZoom = mapInstance.getZoom() || 15;
        const targetZoom = Math.max(currentZoom, 17); // Always zoom to at least level 17
        console.log("MapVis: Setting zoom from", currentZoom, "to", targetZoom);
        mapInstance.setZoom(targetZoom);
      }, 300);
    }
  }, [selectedPlanLocation, mapInstance]);

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (setShowDirectionsMode) {
      setShowDirectionsMode(isChecked);
    } else {
      console.warn(
        "MapVis: setShowDirectionsMode prop is missing. The toggle state cannot be updated in the parent component."
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div style={mapContainerStyle}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          mapId={"my-map-id-app"}
          disableDefaultUI={true}
          gestureHandling={"greedy"}
          style={{ width: "100%", height: "100%" }}
        >
          {highlightedMarker && !isRouteActive && (
            <Marker position={highlightedMarker} title={"Selected Stop"} />
          )}

          {isRouteActive && routeRequest && (
            <>
              <Marker position={routeRequest.origin} title={"Origin"} />
              <Marker
                position={routeRequest.destination}
                title={"Destination"}
              />
            </>
          )}

          {!isRouteActive &&
            !highlightedMarker &&
            planLocations &&
            planLocations.length > 0 &&
            planLocations.map((location, index) => (
              <Marker
                key={`plan-location-${index}`}
                position={{ lat: location.lat, lng: location.lng }}
                title={`${location.name} (Day ${location.day || "N/A"}) - ${
                  location.type
                }`}
                icon={{
                  url:
                    location.type === "hotel"
                      ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                      : location.type === "restaurant"
                      ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                      : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                }}
                onClick={() => {
                  console.log("MapVis: Plan marker clicked:", location);
                  console.log(
                    "MapVis: About to dispatch setSelectedPlanLocation"
                  );
                  dispatch(setSelectedPlanLocation(location));
                  console.log("MapVis: Dispatched setSelectedPlanLocation");
                }}
              />
            ))}
        </Map>

        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1,
            maxWidth: "300px",
          }}
        >
          {isRouteActive &&
            directionsResponse &&
            directionsResponse.routes[0]?.legs[0] && (
              <div
                style={{
                  padding: "10px",
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  color: "black",
                }}
              >
                <h3>{directionsResponse.routes[0].summary}</h3>
                <p>
                  <strong>From:</strong>{" "}
                  {directionsResponse.routes[0].legs[0].start_address}
                </p>
                <p>
                  <strong>To:</strong>{" "}
                  {directionsResponse.routes[0].legs[0].end_address}
                </p>
                <p>
                  <strong>Distance:</strong>{" "}
                  {directionsResponse.routes[0].legs[0].distance?.text}
                </p>
                <p>
                  <strong>Duration:</strong>{" "}
                  {directionsResponse.routes[0].legs[0].duration?.text}
                </p>
              </div>
            )}

          {!isRouteActive && !highlightedMarker && selectedPlanLocation && (
            <div
              style={{
                padding: "12px",
                background: "rgba(255, 255, 255, 0.95)",
                border: "2px solid #1976d2",
                borderRadius: "6px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                color: "black",
                fontSize: "0.9rem",
                minWidth: "250px",
                marginBottom: "10px",
              }}
            >
              <h4 style={{ margin: "0 0 8px 0", color: "#1976d2" }}>
                📍 {selectedPlanLocation.name}
              </h4>
              <div style={{ marginBottom: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor:
                        selectedPlanLocation.type === "hotel"
                          ? "#4285f4"
                          : selectedPlanLocation.type === "restaurant"
                          ? "#34a853"
                          : "#ea4335",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <span
                    style={{ textTransform: "capitalize", fontWeight: "500" }}
                  >
                    {selectedPlanLocation.type}
                  </span>
                </div>
                {selectedPlanLocation.day && (
                  <p
                    style={{
                      margin: "4px 0",
                      color: "#666",
                      fontSize: "0.85rem",
                    }}
                  >
                    📅 Day {selectedPlanLocation.day}
                  </p>
                )}
              </div>
              <div style={{ borderTop: "1px solid #eee", paddingTop: "8px" }}>
                <button
                  onClick={() => dispatch(setSelectedPlanLocation(null))}
                  style={{
                    background: "#f5f5f5",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
          )}

          {!isRouteActive &&
            !highlightedMarker &&
            !selectedPlanLocation &&
            planLocations &&
            planLocations.length > 0 && (
              <div
                style={{
                  padding: "10px",
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  color: "black",
                  fontSize: "0.9rem",
                }}
              >
                <h4 style={{ margin: "0 0 8px 0" }}>
                  Travel Plan Locations ({planLocations.length})
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#4285f4",
                        borderRadius: "50%",
                      }}
                    ></div>
                    <span>Hotels</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#34a853",
                        borderRadius: "50%",
                      }}
                    ></div>
                    <span>Restaurants</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#ea4335",
                        borderRadius: "50%",
                      }}
                    ></div>
                    <span>Places</span>
                  </div>
                </div>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "0.8rem",
                    color: "#666",
                  }}
                >
                  Click on places in the plan to highlight them on the map
                </p>
              </div>
            )}
        </div>
      </div>

      <div style={controlsContainerStyle}>
        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={showDirectionsMode}
            onChange={handleToggleChange}
            style={{ marginRight: "8px" }}
          />
          Show Directions
        </label>

        {showDirectionsMode && (
          <button
            onClick={handleClearPath}
            style={
              !selectedLocation && !routeRequest
                ? buttonDisabledStyle
                : buttonStyle
            }
            disabled={!selectedLocation && !routeRequest}
          >
            Clear Path
          </button>
        )}

        {!showDirectionsMode && highlightedMarker && (
          <button
            onClick={() => {
              setHighlightedMarker(null);
              console.log("MapVis: Clearing highlighted marker");
              console.log("MapVis: isRouteActive:", isRouteActive);
              console.log("MapVis: highlightedMarker:", highlightedMarker);
              console.log(
                "MapVis: selectedPlanLocation:",
                selectedPlanLocation
              );
            }}
            style={buttonStyle}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

interface MapVisProps {
  showDirectionsMode: boolean;
  setShowDirectionsMode?: (value: boolean) => void;
  threadId: string | null;
}

const MapVis = ({
  showDirectionsMode,
  setShowDirectionsMode,
  threadId,
}: MapVisProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div>
        Error: Google Maps API Key is missing. Ensure
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <AppMapVis
        showDirectionsMode={showDirectionsMode}
        setShowDirectionsMode={setShowDirectionsMode}
        threadId={threadId}
      />
    </APIProvider>
  );
};

export default MapVis;
