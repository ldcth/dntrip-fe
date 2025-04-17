import { FC, useState, useEffect } from "react";
// import { Location } from "../services/chatService";

interface Location {
  name: string;
  lat: number;
  lng: number;
  description: string;
}
interface MapViewProps {
  locations?: Location[];
}

const MapView: FC<MapViewProps> = ({ locations }) => {
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (locations && locations.length > 0) {
      setShowMap(true);
    }
  }, [locations]);

  if (!showMap) {
    return null;
  }

  return (
    <div className="h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Travel Destinations
        </h2>
      </div>
      <div className="h-[calc(100%-64px)]">
        <div className="h-full flex flex-col">
          {/* Location List */}
          <div className="p-4 overflow-y-auto">
            {locations?.map((location, index) => (
              <div key={index} className="mb-4 p-3 bg-white rounded-lg shadow">
                <h3 className="font-semibold text-gray-800">{location.name}</h3>
                <p className="text-sm text-gray-800 mt-1">
                  {location.description}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Coordinates: {location.lat}, {location.lng}
                </p>
              </div>
            ))}
          </div>

          {/* Map Placeholder */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-800">
              Google Maps integration coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
