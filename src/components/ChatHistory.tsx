import { FC, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface ChatHistoryProps {
  isLoggedIn: boolean;
  onToggle: (isExpanded: boolean) => void;
}

const ChatHistory: FC<ChatHistoryProps> = ({ isLoggedIn, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle(newState);
  };

  return (
    <div
      className={`p-4 transition-all duration-300 ease-in-out ${
        isExpanded ? "w-full" : "w-16"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        {isExpanded && (
          <h2 className="text-xl font-semibold text-gray-800 truncate">
            {isLoggedIn ? "Chat History" : "Welcome"}
          </h2>
        )}
        <button
          onClick={handleToggle}
          className="p-1 rounded-md text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 cursor-pointer"
          aria-label={isExpanded ? "Collapse history" : "Expand history"}
        >
          {isExpanded ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          {!isLoggedIn ? (
            <div className="text-center">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full mt-2 cursor-pointer">
                Log In
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                <p className="text-sm font-medium text-gray-800 truncate">
                  Best places to visit in Vietnam
                </p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
              <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                <p className="text-sm font-medium text-gray-800 truncate">
                  Travel itinerary for 7 days
                </p>
                <p className="text-xs text-gray-500">1 week ago</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatHistory;
