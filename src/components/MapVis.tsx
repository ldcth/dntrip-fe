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
