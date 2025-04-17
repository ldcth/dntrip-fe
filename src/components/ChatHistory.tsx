import { FC } from "react";

interface ChatHistoryProps {
  isLoggedIn: boolean;
}

const ChatHistory: FC<ChatHistoryProps> = ({ isLoggedIn }) => {
  if (!isLoggedIn) {
    return (
      <div className="p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Welcome to Travel Assistant
          </h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Chat History</h2>
      <div className="space-y-2">
        {/* Sample chat history items */}
        <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
          <p className="text-sm font-medium text-gray-800">
            Best places to visit in Vietnam
          </p>
          <p className="text-xs text-gray-800">2 days ago</p>
        </div>
        <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
          <p className="text-sm font-medium text-gray-800">
            Travel itinerary for 7 days
          </p>
          <p className="text-xs text-gray-800">1 week ago</p>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
