import { useState } from "react";
import ChatHistory from "../components/ChatHistory";
import ChatInterface from "../components/ChatInterface";
import MapView from "../components/MapView";

export default function Home() {
  const [showMap, setShowMap] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  const handleShowMap = (newLocations: Location[]) => {
    setLocations(newLocations);
    setShowMap(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat History Sidebar */}
      <div className="w-1/4 border-r border-gray-200 bg-white">
        <ChatHistory isLoggedIn={isLoggedIn} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <ChatInterface onShowMap={handleShowMap} isLoggedIn={isLoggedIn} />
        </div>
      </div>

      {/* Map View (Hidden by default) */}
      {showMap && (
        <div className="w-1/3 border-l border-gray-200">
          <MapView locations={locations} />
        </div>
      )}
    </div>
  );
}
