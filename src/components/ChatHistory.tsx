import { FC } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface ChatHistoryProps {
  isLoggedIn: boolean;
  isExpanded: boolean;
  onToggle: (isExpanded: boolean) => void;
  onNewChat: () => void;
}

const ChatHistory: FC<ChatHistoryProps> = ({
  isLoggedIn,
  isExpanded,
  onToggle,
  onNewChat,
}) => {
  const handleToggle = () => {
    onToggle(!isExpanded);
  };

  return (
    <div
      className={`flex flex-col h-full p-4 transition-all duration-300 ease-in-out ${
        isExpanded ? "w-full" : "w-16"
      }`}
    >
      <div
        className={`flex ${
          isExpanded ? "justify-between" : "justify-center"
        } items-center mb-4 shrink-0`}
      >
        {isExpanded && (
          <h2 className="text-xl font-semibold text-gray-800 truncate">
            {isLoggedIn ? "Chat History" : "Welcome"}
          </h2>
        )}
        <button
          onClick={handleToggle}
          className="p-1 rounded-md text-gray-500 hover:bg-gray-200 focus:outline-none cursor-pointer"
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
        <div className="flex-grow overflow-y-auto mb-4">
          <button
            onClick={onNewChat}
            className="flex items-center justify-center gap-2 w-full mb-4 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 cursor-pointer focus:outline-none transition-colors duration-200 ease-in-out"
          >
            <PlusIcon className="h-5 w-5" />
            New Chat
          </button>
          {isLoggedIn ? (
            <>
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
            </>
          ) : (
            <div className="space-y-2">
              {/* Content for non-logged-in users (if any besides the login button) could go here */}
            </div>
          )}
        </div>
      )}
      {!isLoggedIn && isExpanded && <div className="flex-grow"></div>}

      {isExpanded && !isLoggedIn && (
        <div className="shrink-0 pt-4">
          <button className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 cursor-pointer focus:outline-none transition-colors duration-200 ease-in-out">
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Log In
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
