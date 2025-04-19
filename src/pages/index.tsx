import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatHistory from "../components/ChatHistory";
import ChatInterface, { Location } from "../components/ChatInterface";
import MapView from "../components/MapView";

const SESSION_STORAGE_THREAD_KEY = "chatThreadId";

export default function Home() {
  const [showMap, setShowMap] = useState(false);
  const [isLoggedIn] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    let currentThreadId = sessionStorage.getItem(SESSION_STORAGE_THREAD_KEY);
    if (!currentThreadId) {
      currentThreadId = uuidv4();
      sessionStorage.setItem(SESSION_STORAGE_THREAD_KEY, currentThreadId);
    }
    setThreadId(currentThreadId);
  }, []);

  const handleShowMap = (newLocations: Location[]) => {
    setLocations(newLocations);
    setShowMap(true);
  };

  const handleHistoryToggle = (isExpanded: boolean) => {
    setIsHistoryExpanded(isExpanded);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat History Sidebar - Dynamic Width */}
      <div
        className={`border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${
          isHistoryExpanded ? "w-1/4" : "w-16"
        }`}
      >
        <ChatHistory isLoggedIn={isLoggedIn} onToggle={handleHistoryToggle} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {threadId && (
            <ChatInterface
              onShowMap={handleShowMap}
              isLoggedIn={isLoggedIn}
              threadId={threadId}
            />
          )}
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
