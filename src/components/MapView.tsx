import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
// import { log } from "console"; // Removed unused import
import { useState } from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
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
};

// Remove isVisible prop definition
/*
interface MapViewProps {
  isVisible: boolean;
}
*/

// Remove isVisible from component props
const MapView: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  // Remove apiLoaded state - LoadScript stays mounted
  // const [apiLoaded, setApiLoaded] = useState(false);
  // State for lat/lng input fields
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  // State to hold the coordinates of the searched location for the marker
  const [searchedLocation, setSearchedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Function to pan the map to specific coordinates
  const panToLocation = (coords: { lat: number; lng: number }) => {
    // Guard against map not being ready yet
    if (map) {
      map.panTo(coords);
      map.setZoom(13);
    } else {
      console.error("Attempted to pan before map was loaded.");
    }
  };

  // Handler for the search button
  const handleSearch = () => {
    setSearchedLocation(null);
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (isNaN(lat) || isNaN(lng)) {
      setSearchError("Please enter valid numbers for latitude and longitude.");
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setSearchError(
        "Latitude must be between -90 and 90, Longitude between -180 and 180."
      );
      return;
    }

    setSearchError(null);
    const newCoords = { lat, lng };
    setSearchedLocation(newCoords);
    panToLocation(newCoords);
  };

  return (
    // Remove conditional display style based on isVisible prop
    // <div style={{ position: "relative", display: isVisible ? "block" : "none" }}>
    <div style={{ position: "relative" }}>
      {" "}
      {/* Keep position relative if needed, or remove style entirely */}
      {/* Remove onLoad from LoadScript, map renders immediately if script is loaded */}
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
      >
        {/* No need for apiLoaded check anymore */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={15}
          onLoad={(mapInstance) => setMap(mapInstance)} // Still need to get map instance
          options={{
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          {/* Permanent default center marker */}
          <Marker
            position={defaultCenter}
            label="D"
            title="Default Location"
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />

          {/* Searched Location Marker (Blue) */}
          {searchedLocation && (
            <Marker
              position={searchedLocation}
              label="S" // Label for Searched
              title={`Searched: ${searchedLocation.lat.toFixed(
                4
              )}, ${searchedLocation.lng.toFixed(4)}`}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Blue icon
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
      {/* Buttons to pan to specific locations */}
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
          onMouseEnter={() => panToLocation(locations.nyc)}
          style={buttonStyle("#007bff")}
        >
          Go to NYC
        </button>
        <button
          onClick={() => panToLocation(locations.la)}
          onMouseEnter={() => panToLocation(locations.la)}
          style={buttonStyle("#28a745")}
        >
          Go to LA
        </button>
        <button
          onClick={() => panToLocation(locations.london)}
          onMouseEnter={() => panToLocation(locations.london)}
          style={buttonStyle("#dc3545")}
        >
          Go to London
        </button>
      </div>
      {/* Input fields and search button */}
      <div
        style={{
          padding: "0 10px 10px 10px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="number"
          placeholder="Latitude"
          value={latInput}
          onChange={(e) => setLatInput(e.target.value)}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={lngInput}
          onChange={(e) => setLngInput(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleSearch} style={buttonStyle("#6c757d")}>
          Search
        </button>
      </div>
      {/* Error message display */}
      {searchError && (
        <div
          style={{
            padding: "0 10px 10px 10px",
            color: "red",
            fontSize: "0.9em",
            fontWeight: "bold",
          }}
        >
          {searchError}
        </div>
      )}
    </div>
  );
};

// Helper function for button styles to avoid repetition
const buttonStyle = (backgroundColor: string) => ({
  padding: "10px 15px",
  backgroundColor,
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
});

// Helper function for input styles
const inputStyle = {
  padding: "10px",
  border: "1px solid #888",
  borderColor: "#888",
  borderRadius: "4px",
  flexGrow: 1,
  color: "black",
};

export default MapView;
