import React, { useState, useCallback, useEffect } from "react";
import {
  APIProvider,
  Map,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

const containerStyle = {
  width: "100%",
  height: "500px",
  position: "relative" as const, // Needed for absolute positioning of child
};

const defaultCenter = {
  lat: 16.0612266,
  lng: 108.2271015,
};

// Define the locations for the buttons
const locations = {
  nyc: { lat: 40.7128, lng: -74.006, name: "New York City" },
  la: { lat: 34.0522, lng: -118.2437, name: "Los Angeles" },
  london: { lat: 51.5074, lng: -0.1278, name: "London" },
  nhaGo: {
    lat: 16.0679495,
    lng: 108.2232911,
    name: "Nhà hàng Nhà Gỗ Đà Nẵng",
  },
  auRestaurant: {
    lat: 16.0701185,
    lng: 108.2192087,
    name: "Au Restaurant",
  },
  tom82: {
    lat: 16.0650365,
    lng: 108.2215179,
    name: "TOM82 DANANG Restaurant", // Simplified name for button
  },
};

// Helper function for button styles - Remove React.CSSProperties return type annotation
const buttonStyle = (backgroundColor: string) => ({
  padding: "10px 15px",
  backgroundColor,
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "1rem", // Ensure text is readable
});

// MapInteractionComponent - Remove React.FC and define props type inline
const MapInteractionComponent = ({
  panToLocation,
  showDirectionsTo,
  clearDirections,
  isDirectionsActive,
}: {
  panToLocation: (coords: { lat: number; lng: number }) => void;
  showDirectionsTo: (coords: { lat: number; lng: number }) => void;
  clearDirections: () => void;
  isDirectionsActive: boolean;
}) => {
  // Buttons to pan to specific locations
  return (
    <div>
      <div
        style={{
          padding: "10px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => panToLocation(locations.nyc)}
          style={buttonStyle("#007bff")}
        >
          Go to NYC
        </button>
        <button
          onClick={() => panToLocation(locations.la)}
          style={buttonStyle("#28a745")}
        >
          Go to LA
        </button>
        <button
          onClick={() => panToLocation(locations.london)}
          style={buttonStyle("#dc3545")}
        >
          Go to London
        </button>
        <button
          onClick={() => showDirectionsTo(locations.nhaGo)}
          style={buttonStyle("#ffc107")}
        >
          Directions to {locations.nhaGo.name}
        </button>
        <button
          onClick={() => showDirectionsTo(locations.auRestaurant)}
          style={buttonStyle("#17a2b8")}
        >
          Directions to {locations.auRestaurant.name}
        </button>
        <button
          onClick={() => showDirectionsTo(locations.tom82)}
          style={buttonStyle("#fd7e14")}
        >
          Directions to {locations.tom82.name}
        </button>
        {isDirectionsActive && (
          <button onClick={clearDirections} style={buttonStyle("#6c757d")}>
            Clear Directions
          </button>
        )}
      </div>
    </div>
  );
};

// Main component - Remove React.FC
const AppMapVis = () => {
  const mapInstance = useMap();
  const routesLibrary = useMapsLibrary("routes");

  const [directionsService, setDirectionsService] = useState<
    google.maps.DirectionsService | undefined
  >();
  const [directionsRenderer, setDirectionsRenderer] = useState<
    google.maps.DirectionsRenderer | undefined
  >();
  const [destination, setDestination] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);

  // Initialize Directions Service and Renderer - useEffect is now used
  useEffect(() => {
    if (!routesLibrary || !mapInstance) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(
      new routesLibrary.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true,
      })
    );
    // Clean up renderer on component unmount or when mapInstance/routesLibrary changes
    return () => {
      directionsRenderer?.setMap(null);
    };
  }, [routesLibrary, mapInstance]);

  // Fetch directions when destination changes - useEffect is now used
  useEffect(() => {
    if (!directionsService || !directionsRenderer) {
      // console.log("Directions service/renderer not ready yet.");
      return;
    }

    if (destination) {
      // console.log("Fetching directions to:", destination);
      directionsService
        .route({
          origin: defaultCenter,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        })
        .then((response) => {
          console.log("Directions received:", response);
          directionsRenderer.setDirections(response);
          setDirectionsResponse(response);
        })
        .catch((e) => {
          console.error("Directions request failed", e);
          setDestination(null); // Clear destination on error
          directionsRenderer.setDirections(null); // Clear map on error
        });
    } else if (directionsRenderer?.hasOwnProperty("directions")) {
      // Destination is null - Clear Renderer and Response State
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
          // Clear response state ONLY AFTER successful renderer clear
          setDirectionsResponse(null);
        } catch (error) {
          console.error("Effect Error calling setDirections(null):", error);
          // Still clear response state even if renderer clear fails
          setDirectionsResponse(null);
        }
      } else {
        console.log("Renderer not available in effect when trying to clear.");
        // Clear response state if renderer isn't available
        setDirectionsResponse(null);
      }
    }
  }, [directionsService, directionsRenderer, destination]);

  // Function to pan the map to specific coordinates
  const panToLocation = useCallback(
    (coords: { lat: number; lng: number }) => {
      if (mapInstance) {
        mapInstance.panTo(coords);
        mapInstance.setZoom(13); // Adjust zoom level as needed
        setDestination(null); // Clear destination when panning manually
      } else {
        // This might log if called before map is fully ready, handle appropriately
        console.error(
          "Attempted to pan before map instance was available in AppMapVis."
        );
      }
    },
    [mapInstance]
  ); // Dependency on map instance from useMap()

  const showDirectionsTo = useCallback(
    (coords: { lat: number; lng: number }) => {
      setDestination(coords);
    },
    []
  );

  const clearDirections = useCallback(() => {
    console.log(
      "Clear Directions button clicked - setting destination to null"
    );
    setDestination(null);
    // Let the useEffect handle clearing directionsResponse state
  }, []);

  const isDirectionsActive = !!destination;

  return (
    <div style={containerStyle}>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={15}
        mapId={"my-map-id-app"} // Unique mapId if needed
        disableDefaultUI={true}
        gestureHandling={"greedy"}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Markers shown when NOT directing */}
        {!isDirectionsActive && (
          <>
            {/* Default Location Marker */}
            <Marker position={defaultCenter} title={"Default Location"} />

            {/* Predefined Location Markers */}
            {Object.entries(locations).map(([key, loc]) => (
              <Marker key={key} position={loc} title={loc.name} />
            ))}
          </>
        )}

        {/* Markers shown ONLY when directing */}
        {isDirectionsActive && destination && (
          <>
            {/* Origin Marker (Default Center) */}
            <Marker
              position={defaultCenter}
              title={"Origin: Default Location"}
              // Optional: customize icon for origin
              // icon={{ url: 'path/to/origin_icon.png' }}
            />
            {/* Destination Marker */}
            <Marker
              position={destination}
              title={"Destination"} // Title could be more specific if name was stored
              // Optional: customize icon for destination
              // icon={{ url: 'path/to/destination_icon.png' }}
            />
          </>
        )}
      </Map>

      {/* Pass necessary state and handlers down */}
      <MapInteractionComponent
        panToLocation={panToLocation}
        showDirectionsTo={showDirectionsTo}
        clearDirections={clearDirections}
        isDirectionsActive={isDirectionsActive}
      />

      {/* Absolutely Positioned Directions Info Box with updated styles */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1, // Ensure it's above map tiles
          maxWidth: "300px", // Prevent it getting too wide
        }}
      >
        {isDirectionsActive &&
          directionsResponse &&
          directionsResponse.routes[0]?.legs[0] && (
            <div
              style={{
                padding: "10px",
                background: "rgba(255, 255, 255, 0.9)", // Slightly transparent background
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Add a subtle shadow
                color: "black", // Make text black
              }}
            >
              {/* Add Route Summary */}
              <h3>{directionsResponse.routes[0].summary}</h3>
              <p>
                <strong>From:</strong> Default Location
              </p>
              <p>
                {/* Destination could be more specific if we stored the name */}
                <strong>To:</strong> Destination ({destination?.lat.toFixed(4)},{" "}
                {destination?.lng.toFixed(4)})
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
  );
};

const MapVis = () => {
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
      {/* AppMapVis contains the Map and needs to be inside APIProvider */}
      <AppMapVis />
    </APIProvider>
  );
};

export default MapVis;
