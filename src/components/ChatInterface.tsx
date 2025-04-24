import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModelApi } from "../api";
import PlanDisplay, { StructuredPlan } from "./PlanDisplay";
import FlightTable, { FlightData } from "./FlightTable";

// --- Location Interface (Matching MapView's expectation for mock data) ---
// Note: This might differ from the Location type returned by your actual API
// Export this type so Home can import it
export interface MockLocation {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

// --- Added: Interface for raw flight data from API (Kept here as it's used for mapping) ---
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

// --- Message Interface (Updated - FlightData is now imported) ---
interface Message {
  role: "user" | "assistant";
  content: string;
  parsedFlights?: FlightData[] | null; // Uses imported FlightData
  parsedPlan?: StructuredPlan | null;
}

// --- ChatInterface Component (No significant changes needed in logic) ---
const ChatInterface = ({ onShowMap, threadId }: ChatInterfaceProps) => {
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

      // Add these logs:
      console.log("API Response Received:", response.data);
      console.log(
        "Intent:",
        response.data.intent,
        "(Type:",
        typeof response.data.intent,
        ")"
      );
      console.log(
        "Response Data:",
        response.data.response,
        "(Type:",
        typeof response.data.response,
        ")"
      );
      console.log(
        "Is Response Data an Array?",
        Array.isArray(response.data.response)
      );

      const intent = response.data.intent;
      const responseData = response.data.response;

      let parsedFlightsData: FlightData[] | null = null;
      let parsedPlanData: StructuredPlan | null = null;
      let textResponseContent: string = ""; // Content for streaming/placeholder

      // --- Check intent and response type ---
      if (
        typeof intent === "string" &&
        intent.toLowerCase().includes("flight") &&
        Array.isArray(responseData)
      ) {
        // --- Handle FLIGHT data ---
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
          .filter((flight) => flight.id !== "N/A");
        textResponseContent = "Okay, I found these flights:"; // Placeholder text
      } else if (
        // --- Modified Condition: Check object type first, then intent OR structure ---
        typeof responseData === "object" && // Check if it's an object first
        responseData !== null &&
        !Array.isArray(responseData) && // THEN check if intent is 'plan' OR structure matches
        ((typeof intent === "string" &&
          intent.toLowerCase().includes("plan")) ||
          ("hotel" in responseData && "daily_plans" in responseData))
      ) {
        // --- Handle PLAN data ---
        // Assuming responseData directly matches StructuredPlan for now
        // Add validation/mapping if needed based on actual API response
        parsedPlanData = responseData as StructuredPlan; // Type assertion
        textResponseContent = "Here is the travel plan I generated:"; // Placeholder text
      } else if (typeof responseData === "string") {
        // --- Handle standard TEXT responses ---
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
          parsedFlights: parsedFlightsData,
          parsedPlan: parsedPlanData, // Store the structured plan data (or null)
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
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        // Only remove if the last message was an empty assistant placeholder
        if (lastMsg && lastMsg.role === "assistant" && lastMsg.content === "") {
          return [
            ...prev.slice(0, -1),
            {
              role: "assistant" as const,
              content: "Sorry... Please try again.",
            },
          ];
        }
        // Otherwise, just append the error message
        return [
          ...prev,
          { role: "assistant" as const, content: "Sorry... Please try again." },
        ];
      });
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
                      : message.parsedFlights || message.parsedPlan
                      ? "bg-white text-gray-800 w-full"
                      : "bg-white text-gray-800"
                  } ${
                    message.role === "assistant" &&
                    (message.parsedFlights || message.parsedPlan)
                      ? "p-0 overflow-hidden"
                      : "px-4 py-3"
                  }`}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : message.parsedFlights ? (
                    <FlightTable flights={message.parsedFlights} />
                  ) : message.parsedPlan ? (
                    <PlanDisplay plan={message.parsedPlan} />
                  ) : (
                    <div className="prose prose-sm max-w-none text-gray-800 prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-strong:font-semibold">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content || "..."}
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
