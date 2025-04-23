import { FC, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModelApi } from "../api";

// --- Location Interface (Matching MapView's expectation for mock data) ---
// Note: This might differ from the Location type returned by your actual API
// Export this type so Home can import it
export interface MockLocation {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

// --- Flight Data Structures (Updated to align with potential JSON keys) ---
interface FlightData {
  id: string; // Corresponds to flight_id
  departure: string; // Corresponds to departure_time
  arrival: string; // Corresponds to arrival_time
  duration: string; // Corresponds to flight_time
  price: string; // Corresponds to price
  date?: string; // Optional new field
  departure_airport?: string; // Optional new field
  arrival_airport?: string; // Optional new field
}

// --- Added: Interface for raw flight data from API ---
interface RawFlightDataFromAPI {
  flight_id?: string;
  departure_time?: string;
  arrival_time?: string;
  flight_time?: string;
  price?: string;
  date?: string;
  departure_airport?: string;
  arrival_airport?: string;
  // Add other potential fields if necessary
}

// --- Plan Data Structures (Removed) ---
// interface PlanActivity { ... }
// interface PlanDay { ... }
// interface PlanAccommodation { ... }
// interface StructuredPlan { ... }

// --- Helper function to parse flight text (REMOVED) ---
// const parseFlightText = (...) => { ... };

// --- Helper function to parse plan text (Removed) ---
// const parsePlanText = (text: string): StructuredPlan | null => { ... };

// --- Flight Table Component (Existing - maybe update later?) ---
interface FlightTableProps {
  flights: FlightData[];
}
const FlightTable: FC<FlightTableProps> = ({ flights }) => {
  if (!flights || flights.length === 0) {
    return <p>No flight data available to display.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Flight ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Departure
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Arrival
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {flights.map((flight, index) => (
            <tr key={index}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {flight.id}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {flight.departure}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {flight.arrival}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {flight.duration}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {flight.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Plan Display Components (Removed) ---
// const AccommodationInfo: FC<{ info: PlanAccommodation }> = ({ info }) => { ... };
// const ActivityItem: FC<{ item: PlanActivity }> = ({ item }) => { ... };
// const DayCard: FC<{ dayData: PlanDay }> = ({ dayData }) => { ... };
// const PlanDisplay: FC<{ plan: StructuredPlan }> = ({ plan }) => { ... };

// --- Location Interface (Existing) ---
export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

// --- ChatInterfaceProps Interface (Existing) ---
interface ChatInterfaceProps {
  onShowMap: (locations: MockLocation[]) => void;
  isLoggedIn: boolean;
  threadId: string;
}

// --- Message Interface (No changes needed here) ---
interface Message {
  role: "user" | "assistant";
  content: string; // Will hold placeholder text for flight responses
  parsedFlights?: FlightData[] | null; // Will hold the structured array
}

// --- ChatInterface Component (Updated handleSend) ---
const ChatInterface: FC<ChatInterfaceProps> = ({ onShowMap, threadId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const streamingMessageRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to clear messages when threadId changes
  useEffect(() => {
    setMessages([]); // Clear messages when threadId changes
    setInput(""); // Clear input field as well
    console.log("ChatInterface: threadId changed, clearing messages.");
  }, [threadId]); // Dependency array includes threadId

  useEffect(() => {
    return () => {
      if (streamingMessageRef.current) {
        clearTimeout(streamingMessageRef.current);
      }
    };
  }, []);

  // --- Mock Location Data for Testing ---
  const mockLocations: MockLocation[] = [
    {
      name: "Mock Location A (NYC)",
      lat: 40.7128,
      lng: -74.006,
      description: "New York City",
    },
    {
      name: "Mock Location B (LA)",
      lat: 34.0522,
      lng: -118.2437,
      description: "Los Angeles",
    },
    {
      name: "Mock Location C (London)",
      lat: 51.5074,
      lng: -0.1278,
      description: "London",
    },
  ];

  // --- Functions to Trigger Map with Mock Data ---
  const showMockMap = () => {
    console.log("TEST: Showing map with MOCK data");
    onShowMap(mockLocations); // Call the prop passed from parent
  };

  const hideMap = () => {
    console.log("TEST: Hiding map");
    onShowMap([]); // Call the prop with empty array to hide/clear
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;
    const newMessages: Message[] = [
      ...messages,
      { role: "user" as const, content: trimmedInput },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    if (streamingMessageRef.current) {
      clearTimeout(streamingMessageRef.current);
    }

    try {
      const response = await ModelApi.getAnswerByUser({
        question: trimmedInput,
        thread_id: threadId,
      });
      const intent = response.data.intent;
      const responseData = response.data.response; // This can be string or array now

      let parsedFlightsData: FlightData[] | null = null;
      let textResponseContent: string = ""; // Content for streaming

      // --- Check intent and if response is an array for flights ---
      if (
        typeof intent === "string" &&
        intent.toLowerCase().includes("flight") &&
        Array.isArray(responseData)
      ) {
        // Map the JSON array, using the defined RawFlightDataFromAPI type
        parsedFlightsData = responseData
          .map((flight: RawFlightDataFromAPI) => {
            let cleanId = flight.flight_id || "N/A";
            const operatorIndex = cleanId.indexOf(" · Operated by");
            if (operatorIndex !== -1) {
              cleanId = cleanId.substring(0, operatorIndex).trim();
            }

            return {
              id: cleanId,
              departure: flight.departure_time || "N/A",
              arrival: flight.arrival_time || "N/A",
              duration: flight.flight_time || "N/A",
              price: flight.price || "N/A",
              date: flight.date,
              departure_airport: flight.departure_airport,
              arrival_airport: flight.arrival_airport,
            };
          })
          .filter((flight) => flight.id !== "N/A"); // Filter out any potential failures

        // Use a generic text response for streaming, as data is structured
        textResponseContent = "Okay, I found these flights:";
      } else if (typeof responseData === "string") {
        // Handle standard text responses
        textResponseContent = responseData;
      } else {
        // Unexpected response format
        console.error("Unexpected API response format:", response.data);
        textResponseContent = "Sorry, I received an unexpected response.";
      }

      const finalMessages = [
        ...newMessages,
        {
          role: "assistant" as const,
          content: "", // Start content empty for streaming
          parsedFlights: parsedFlightsData, // Store the structured data (or null)
        },
      ];
      setMessages(finalMessages);
      setIsLoading(false);

      // Stream the textResponseContent (placeholder or actual text)
      let currentContent = "";
      const words = textResponseContent.split(/(\s+)/);
      let wordIndex = 0;
      const streamNextWord = () => {
        if (wordIndex < words.length) {
          currentContent += words[wordIndex];
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage) {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: currentContent,
              };
            }
            return updatedMessages;
          });
          wordIndex++;
          streamingMessageRef.current = setTimeout(streamNextWord, 30);
        } else {
          scrollToBottom();
          // Show map locations if any (even with flight table)
          if (response.data.locations && response.data.locations.length > 0) {
            onShowMap(response.data.locations as MockLocation[]);
          }
        }
      };
      streamNextWord();
    } catch (error) {
      console.error("Error:", error);
      if (streamingMessageRef.current) {
        clearTimeout(streamingMessageRef.current);
      }
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant" as const, content: "Sorry... Please try again." },
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-lg overflow-hidden">
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                Travel Assistant
              </h2>
              <p className="text-gray-600">Ask me anything...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-3 shadow-md ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : message.parsedFlights ? (
                    // Render FlightTable if parsedFlights data exists
                    <FlightTable flights={message.parsedFlights} />
                  ) : (
                    // Otherwise, render the streamed content (placeholder or actual response)
                    <div className="prose prose-sm max-w-none text-gray-800 prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-strong:font-semibold">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-xl px-4 py-3 bg-white text-gray-500 shadow-md">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} style={{ height: "1px" }} />
          </>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-100">
        <div className="mb-2 flex justify-center gap-3">
          <button
            onClick={showMockMap}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
          >
            Show Mock Map
          </button>
          <button
            onClick={hideMap}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
          >
            Hide Map
          </button>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about travel..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 transition duration-150 ease-in-out disabled:bg-gray-200"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out cursor-pointer"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
