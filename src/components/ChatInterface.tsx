import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModelApi } from "../api";
import PlanDisplay, { StructuredPlan } from "./PlanDisplay";
import FlightTable, { FlightData } from "./FlightTable";
// Keep IConversation if used by other parts, remove if truly unused
// import { IConversation } from "@/types/conversation.types";
import { IContent } from "@/types/conversation.types";

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
  conversationId: string | null;
}

// --- Message Interface (Updated - FlightData is now imported) ---
interface Message {
  role: "user" | "assistant";
  content: string;
  parsedFlights?: FlightData[] | null; // Uses imported FlightData
  parsedPlan?: StructuredPlan | null;
}

// Helper function to map IContent to Message - ENHANCED
const mapContentToMessage = (content: IContent): Message | null => {
  if (!content) return null;

  // --- Human Message ---
  if (content.type === "Human") {
    return { role: "user", content: content.content || "" };
  }
  // --- AI Message ---
  else if (content.type === "AI") {
    const intent = content.intent?.toLowerCase() || "";
    const responseData = content.content; // Assuming content stores the actual data (string, object, or array)

    console.log(
      // Keep log for debugging structure
      "Mapping AI content:",
      JSON.stringify({
        intent: content.intent,
        type: typeof responseData,
        isArray: Array.isArray(responseData),
        responseData,
      })
    );

    // Check for Flights
    if (intent.includes("flight") && Array.isArray(responseData)) {
      const mappedFlights: FlightData[] = responseData
        .map((flight: RawFlightDataFromAPI): FlightData | null => {
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
        .filter(
          (flight): flight is FlightData =>
            flight !== null && flight.id !== "N/A"
        );

      return {
        role: "assistant",
        parsedFlights: mappedFlights,
        content: "", // Use empty string or placeholder text
      };
    }
    // Check for Plan
    else if (
      (intent.includes("plan") ||
        (typeof responseData === "object" &&
          responseData !== null &&
          "hotel" in responseData)) &&
      typeof responseData === "object" &&
      responseData !== null &&
      !Array.isArray(responseData)
    ) {
      // Assume responseData is already StructuredPlan
      return {
        role: "assistant",
        parsedPlan: responseData as StructuredPlan, // Add type assertion
        content: "", // Use empty string or placeholder text
      };
    }
    // Fallback for standard Text AI message
    else if (typeof responseData === "string") {
      return { role: "assistant", content: responseData };
    }
    // Handle cases where content might be object/array but not flight/plan
    else {
      console.warn(
        "Mapping AI: Unhandled content structure for intent:",
        intent,
        responseData
      );
      // Try converting to string as a last resort, or return error message
      return { role: "assistant", content: "[Unsupported AI message format]" };
    }
  }

  console.warn("Unknown content type in mapContentToMessage:", content.type);
  return null;
};

// --- ChatInterface Component (Original Logic) ---
const ChatInterface = ({
  onShowMap,
  isLoggedIn,
  threadId,
  conversationId,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [contents, setContents] = useState<IContent[]>([]);
  const streamingMessageRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };
  useEffect(() => {
    if (!isChatLoading) {
      scrollToBottom("smooth");
    }
  }, [messages]);

  useEffect(() => {
    if (streamingMessageRef.current) {
      clearTimeout(streamingMessageRef.current);
      streamingMessageRef.current = null;
    }

    setMessages([]);
    setInput("");
    setIsLoading(false);

    if (conversationId && isLoggedIn) {
      console.log(
        `ChatInterface: Fetching content for conversationId: ${conversationId}`
      );
      setIsChatLoading(true);
      ModelApi.getConversationContent(conversationId)
        .then((response) => {
          console.log(
            "ChatInterface: API getConversationContent SUCCESS:",
            response.data
          );

          // --- FIX IS HERE ---
          // Check if response.data itself is the array
          const fetchedContents: IContent[] = Array.isArray(response.data)
            ? response.data // Use response.data directly
            : []; // Fallback to empty array if it's not an array

          // This validation might now be slightly redundant but safe to keep
          if (!Array.isArray(response.data)) {
            // Check the original response.data
            console.error(
              "ChatInterface: Expected an array of contents, but received:",
              response.data
            );
            setMessages([
              { role: "assistant", content: "Error: Invalid format." },
            ]);
            setIsChatLoading(false); // Stop loading on format error
            return;
          }
          // --- END FIX ---

          // Mapping should work now if fetchedContents is populated correctly
          const mappedMessages = fetchedContents
            .map(mapContentToMessage)
            .filter((msg): msg is Message => msg !== null);

          console.log("ChatInterface: Mapped messages:", mappedMessages);
          setMessages(mappedMessages);
          setTimeout(() => scrollToBottom("auto"), 50);
        })
        .catch((error) => {
          console.error(
            "ChatInterface: API getConversationContent FAILED:",
            error
          );
          setMessages([
            { role: "assistant", content: "Sorry, couldn't load history." },
          ]);
        })
        .finally(() => {
          setIsChatLoading(false);
        });
    } else {
      console.log(
        `ChatInterface: Not fetching content. LoggedIn: ${isLoggedIn}, ConvID: ${conversationId}`
      );
      setMessages([]);
      setIsChatLoading(false);
    }

    return () => {
      if (streamingMessageRef.current) {
        clearTimeout(streamingMessageRef.current);
      }
    };
  }, [conversationId, isLoggedIn]);

  // Original Effect to clear messages when threadId changes (keep this simple behavior for now)
  useEffect(() => {
    setMessages([]); // Clear messages when threadId changes
    setInput(""); // Clear input field as well
    console.log(
      "ChatInterface: threadId changed, clearing messages (Original Behavior)."
    );
  }, [threadId]); // Dependency array includes threadId

  useEffect(() => {
    return () => {
      if (streamingMessageRef.current) {
        clearTimeout(streamingMessageRef.current);
      }
    };
  }, []);

  // Original effect related to login status (keep)
  useEffect(() => {
    if (!isLoggedIn) {
      setContents([]);
    }
  }, [isLoggedIn]);

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

  // --- Original handleSend Logic ---
  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || isChatLoading) return;
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
    setContents((contents) => [
      ...contents,
      {
        _id: "",
        conversationId: conversationId || "",
        threadId: threadId,
        content: trimmedInput,
        type: "Human",
        intent: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    try {
      const apiCall = isLoggedIn
        ? ModelApi.getAnswerByUser
        : ModelApi.getAnswerByCustomer;

      const response = await apiCall({
        question: trimmedInput,
        thread_id: threadId, // Send the frontend threadId
      });

      const actualConversationId = response.data?.conversationId || "";

      console.log(`ChatInterface: Sent threadId: "${threadId}"`);
      console.log(
        `ChatInterface: Received conversationId: "${actualConversationId}"`
      );

      // Update contents using the response data and ACTUAL conversationId
      setContents((prevContents) => [
        ...prevContents,
        {
          _id: response.data?.answer_id || "",
          conversationId: actualConversationId, // Use ID from response
          threadId: threadId, // Keep the frontend threadId
          content: response.data.response,
          type: "AI",
          intent: response.data.intent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      console.log("API Response Received (Original):", response.data);

      const intent = response.data.intent;
      const responseData = response.data.response;

      let parsedFlightsData: FlightData[] | null = null;
      let parsedPlanData: StructuredPlan | null = null;
      let textResponseContent: string = ""; // Content for streaming/placeholder

      // Original logic for checking intent and response type
      if (
        typeof intent === "string" &&
        intent.toLowerCase().includes("flight") &&
        Array.isArray(responseData)
      ) {
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
        typeof responseData === "object" &&
        responseData !== null &&
        !Array.isArray(responseData) &&
        ((typeof intent === "string" &&
          intent.toLowerCase().includes("plan")) ||
          ("hotel" in responseData && "daily_plans" in responseData))
      ) {
        parsedPlanData = responseData as StructuredPlan;
        textResponseContent = "Here is the travel plan I generated:"; // Placeholder text
      } else if (typeof responseData === "string") {
        textResponseContent = responseData;
      } else {
        console.error("Unexpected API response format:", response.data);
        textResponseContent = "Sorry, I received an unexpected response.";
      }

      const finalMessages = [
        ...newMessages,
        {
          role: "assistant" as const,
          content: "",
          parsedFlights: parsedFlightsData,
          parsedPlan: parsedPlanData,
        },
      ];
      setMessages(finalMessages);
      setIsLoading(false);

      // Original streaming logic
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
        if (lastMsg && lastMsg.role === "assistant" && lastMsg.content === "") {
          return [
            ...prev.slice(0, -1),
            {
              role: "assistant" as const,
              content: "Sorry... Please try again.",
            },
          ];
        }
        return [
          ...prev,
          { role: "assistant" as const, content: "Sorry... Please try again." },
        ];
      });
      setIsLoading(false);
    }
  }, [
    isLoggedIn,
    threadId,
    conversationId,
    messages,
    input,
    contents,
    onShowMap,
  ]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // Original Render Logic
  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-lg overflow-hidden">
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50"
      >
        {isChatLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                Travel Assistant
              </h2>
              <p className="text-gray-600">
                {isLoggedIn
                  ? "Select a conversation or start a new one."
                  : "Ask me anything..."}
              </p>
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
                        {index === messages.length - 1 && isLoading
                          ? "..."
                          : message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
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
            placeholder={
              isLoggedIn ? "Send a message..." : "Ask about travel..."
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 transition duration-150 ease-in-out disabled:bg-gray-200"
            disabled={isLoading || isChatLoading}
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out cursor-pointer"
            disabled={isLoading || isChatLoading || !input.trim()}
          >
            {isLoading ? "Sending..." : isChatLoading ? "Loading..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
