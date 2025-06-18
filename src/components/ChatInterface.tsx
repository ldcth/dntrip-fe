import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModelApi } from "../api";
import PlanDisplay from "./PlanDisplay";
import FlightTable, { FlightData } from "./FlightTable";
import {
  IContent,
  AiResponseType,
  RawFlightDataFromAPI,
  MockLocation,
  StructuredPlan,
  PlanAgentPayload,
} from "@/types/conversation.types";

export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

interface ChatInterfaceProps {
  onShowMap: (locations: MockLocation[]) => void;
  isLoggedIn: boolean;
  threadId: string;
  conversationId: string | null;
  showDirectionsMode: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  parsedFlights?: FlightData[] | null;
  parsedPlan?: StructuredPlan | null;
  parsedSelectedFlight?: FlightData | null;
}

const mapContentToMessage = (content: IContent): Message | null => {
  if (!content) return null;

  if (content.type === "Human") {
    const humanContent = content.content as string;
    return { role: "user", content: humanContent };
  } else if (content.type === "AI") {
    const intent = content.intent?.toLowerCase() || "";
    const aiResponseObject = content.content as AiResponseType;

    console.log(
      "Mapping AI content:",
      JSON.stringify({
        intent: content.intent,
        type: typeof aiResponseObject,
        aiResponseObject,
      })
    );

    if (
      intent === "flights_found_awaiting_selection" &&
      Array.isArray(aiResponseObject?.flights)
    ) {
      const mappedFlights: FlightData[] = aiResponseObject.flights
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
        content: aiResponseObject.message || "",
      };
    } else if (
      intent === "flight_selection_confirmed" &&
      aiResponseObject?.selected_flight_details &&
      typeof aiResponseObject.selected_flight_details === "object"
    ) {
      const flight = aiResponseObject.selected_flight_details;
      let cleanId = flight.flight_id || "N/A";
      const operatorIndex = cleanId.indexOf(" · Operated by");
      if (operatorIndex !== -1) {
        cleanId = cleanId.substring(0, operatorIndex).trim();
      }
      const mappedSelectedFlight: FlightData = {
        id: cleanId,
        departure: flight.departure_time || "N/A",
        arrival: flight.arrival_time || "N/A",
        duration: flight.flight_time || "N/A",
        price: flight.price || "N/A",
        date: flight.date,
        departure_airport: flight.departure_airport,
        arrival_airport: flight.arrival_airport,
      };
      return {
        role: "assistant",
        parsedSelectedFlight: mappedSelectedFlight,
        content: aiResponseObject.message || "",
      };
    } else if (intent === "retrieve_information") {
      if (
        aiResponseObject?.confirmed_flight_details &&
        typeof aiResponseObject.confirmed_flight_details === "object"
      ) {
        const flight = aiResponseObject.confirmed_flight_details;
        let cleanId = flight.flight_id || "N/A";
        const operatorIndex = cleanId.indexOf(" · Operated by");
        if (operatorIndex !== -1) {
          cleanId = cleanId.substring(0, operatorIndex).trim();
        }
        const mappedConfirmedFlight: FlightData = {
          id: cleanId,
          departure: flight.departure_time || "N/A",
          arrival: flight.arrival_time || "N/A",
          duration: flight.flight_time || "N/A",
          price: flight.price || "N/A",
          date: flight.date,
          departure_airport: flight.departure_airport,
          arrival_airport: flight.arrival_airport,
        };
        return {
          role: "assistant",
          parsedSelectedFlight: mappedConfirmedFlight,
          content: aiResponseObject.message || "",
        };
      } else if (Array.isArray(aiResponseObject?.flights)) {
        const mappedFlights: FlightData[] = aiResponseObject.flights
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
          content: aiResponseObject.message || "",
        };
      } else if (
        aiResponseObject?.plan_details &&
        typeof aiResponseObject.plan_details === "object" &&
        !Array.isArray(aiResponseObject.plan_details) &&
        "hotel" in aiResponseObject.plan_details &&
        "daily_plans" in aiResponseObject.plan_details
      ) {
        return {
          role: "assistant",
          parsedPlan: aiResponseObject.plan_details as StructuredPlan,
          content: aiResponseObject.message || "",
        };
      } else if (typeof aiResponseObject?.message === "string") {
        return { role: "assistant", content: aiResponseObject.message };
      }
    } else if (
      intent === "plan_agent" &&
      aiResponseObject?.plan_details &&
      typeof aiResponseObject.plan_details === "object" &&
      "base_plan" in aiResponseObject.plan_details &&
      typeof (aiResponseObject.plan_details as PlanAgentPayload).base_plan ===
        "object"
    ) {
      const planPayload = aiResponseObject.plan_details as PlanAgentPayload;
      return {
        role: "assistant",
        parsedPlan: planPayload.base_plan,
        content: aiResponseObject.message || "",
      };
    } else if (
      aiResponseObject?.plan_details &&
      typeof aiResponseObject.plan_details === "object" &&
      !Array.isArray(aiResponseObject.plan_details) &&
      "hotel" in aiResponseObject.plan_details &&
      "daily_plans" in aiResponseObject.plan_details
    ) {
      return {
        role: "assistant",
        parsedPlan: aiResponseObject.plan_details as StructuredPlan,
        content: aiResponseObject.message || "",
      };
    } else if (typeof aiResponseObject?.message === "string") {
      return { role: "assistant", content: aiResponseObject.message };
    } else {
      console.warn(
        "Mapping AI: Unhandled content structure for intent:",
        intent,
        aiResponseObject
      );
      return { role: "assistant", content: "[Unsupported AI message format]" };
    }
  }

  console.warn("Unknown content type in mapContentToMessage:", content.type);
  return null;
};

const ChatInterface = ({
  onShowMap,
  isLoggedIn,
  threadId,
  conversationId,
  showDirectionsMode,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [contents, setContents] = useState<IContent[]>([]);
  const [thinkingDots, setThinkingDots] = useState(".");
  const streamingMessageRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

          const fetchedContents: IContent[] = Array.isArray(response.data)
            ? response.data
            : [];

          if (!Array.isArray(response.data)) {
            console.error(
              "ChatInterface: Expected an array of contents, but received:",
              response.data
            );
            setMessages([
              { role: "assistant", content: "Error: Invalid format." },
            ]);
            setIsChatLoading(false);
            return;
          }

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

  useEffect(() => {
    if (isLoading && messages[messages.length - 1]?.role === "user") {
      const interval = setInterval(() => {
        setThinkingDots((prevDots) => {
          if (prevDots === "...") {
            return ".";
          }
          return prevDots + ".";
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setThinkingDots(".");
    }
  }, [isLoading, messages]);

  useEffect(() => {
    setMessages([]);
    setInput("");
    console.log(
      "ChatInterface: threadId changed, clearing messages (Original Behavior)."
    );
  }, [threadId]);

  useEffect(() => {
    return () => {
      if (streamingMessageRef.current) {
        clearTimeout(streamingMessageRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setContents([]);
    }
  }, [isLoggedIn]);

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

  const showMockMap = () => {
    console.log("TEST: Showing map with MOCK data");
    onShowMap(mockLocations);
  };

  const hideMap = () => {
    console.log("TEST: Hiding map");
    onShowMap([]);
  };

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
        thread_id: threadId,
      });

      const actualConversationId = response.data?.thread_id || threadId || "";

      console.log(`ChatInterface: Sent threadId: "${threadId}"`);
      console.log(
        `ChatInterface: Received backend thread_id (used as convId): "${actualConversationId}"`
      );

      setContents((prevContents) => [
        ...prevContents,
        {
          _id: response.data?._id || Date.now().toString(),
          conversationId: actualConversationId,
          threadId: threadId,
          content: response.data.response as AiResponseType,
          type: "AI",
          intent: response.data.intent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      console.log("API Response Received (New Structure):", response.data);

      const intent = response.data.intent?.toLowerCase() || "";
      const responseData = response.data.response as AiResponseType;

      let parsedFlightsData: FlightData[] | null = null;
      let parsedPlanData: StructuredPlan | null = null;
      let parsedSelectedFlightData: FlightData | null = null;
      let textResponseContent: string = "";

      if (
        intent === "flights_found_awaiting_selection" &&
        Array.isArray(responseData?.flights)
      ) {
        parsedFlightsData = responseData.flights
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
        textResponseContent =
          responseData.message || "Okay, I found these flights:";
      } else if (
        intent === "flight_selection_confirmed" &&
        responseData?.selected_flight_details &&
        typeof responseData.selected_flight_details === "object"
      ) {
        const flight = responseData.selected_flight_details;
        let cleanId = flight.flight_id || "N/A";
        const operatorIndex = cleanId.indexOf(" · Operated by");
        if (operatorIndex !== -1) {
          cleanId = cleanId.substring(0, operatorIndex).trim();
        }
        parsedSelectedFlightData = {
          id: cleanId,
          departure: flight.departure_time || "N/A",
          arrival: flight.arrival_time || "N/A",
          duration: flight.flight_time || "N/A",
          price: flight.price || "N/A",
          date: flight.date,
          departure_airport: flight.departure_airport,
          arrival_airport: flight.arrival_airport,
        };
        textResponseContent =
          responseData.message ||
          "Here are the details for the selected flight:";
      } else if (intent === "retrieve_information") {
        if (
          responseData?.confirmed_flight_details &&
          typeof responseData.confirmed_flight_details === "object"
        ) {
          const flight = responseData.confirmed_flight_details;
          let cleanId = flight.flight_id || "N/A";
          const operatorIndex = cleanId.indexOf(" · Operated by");
          if (operatorIndex !== -1) {
            cleanId = cleanId.substring(0, operatorIndex).trim();
          }
          parsedSelectedFlightData = {
            id: cleanId,
            departure: flight.departure_time || "N/A",
            arrival: flight.arrival_time || "N/A",
            duration: flight.flight_time || "N/A",
            price: flight.price || "N/A",
            date: flight.date,
            departure_airport: flight.departure_airport,
            arrival_airport: flight.arrival_airport,
          };
          textResponseContent =
            responseData.message ||
            "Okay, here is the confirmed flight detail I have for you.";
        } else if (Array.isArray(responseData?.flights)) {
          parsedFlightsData = responseData.flights
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
          textResponseContent =
            responseData.message ||
            "Okay, here are the flight options I found.";
        } else if (
          responseData?.plan_details &&
          typeof responseData.plan_details === "object" &&
          "base_plan" in responseData.plan_details &&
          typeof (responseData.plan_details as PlanAgentPayload).base_plan ===
            "object"
        ) {
          parsedPlanData = (responseData.plan_details as PlanAgentPayload)
            .base_plan as StructuredPlan;
          textResponseContent =
            responseData.message || "Here is the travel plan I retrieved:";
        } else if (
          responseData?.plan_details &&
          typeof responseData.plan_details === "object" &&
          !Array.isArray(responseData.plan_details) &&
          "hotel" in responseData.plan_details &&
          "daily_plans" in responseData.plan_details
        ) {
          parsedPlanData = responseData.plan_details as StructuredPlan;
          textResponseContent =
            responseData.message || "Here is the travel plan I generated:";
        } else if (typeof responseData?.message === "string") {
          textResponseContent = responseData.message;
        } else {
          console.error(
            "Unexpected API response format for retrieve_information intent:",
            response.data
          );
          textResponseContent =
            "Sorry, I received an unexpected response structure.";
        }
      } else if (
        intent === "plan_agent" &&
        responseData?.plan_details &&
        typeof responseData.plan_details === "object" &&
        "base_plan" in responseData.plan_details &&
        typeof (responseData.plan_details as PlanAgentPayload).base_plan ===
          "object"
      ) {
        const planPayload = responseData.plan_details as PlanAgentPayload;
        parsedPlanData = planPayload.base_plan;
        textResponseContent =
          responseData.message || "Here is your generated travel plan:";
      } else if (
        responseData?.plan_details &&
        typeof responseData.plan_details === "object" &&
        !Array.isArray(responseData.plan_details) &&
        "hotel" in responseData.plan_details &&
        "daily_plans" in responseData.plan_details
      ) {
        parsedPlanData = responseData.plan_details as StructuredPlan;
        textResponseContent =
          responseData.message || "Here is the travel plan I generated:";
      } else if (typeof responseData?.message === "string") {
        textResponseContent = responseData.message;
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
          parsedSelectedFlight: parsedSelectedFlightData,
        },
      ];
      setMessages(finalMessages);
      setIsLoading(false);

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
          if (responseData.locations && responseData.locations.length > 0) {
            onShowMap(responseData.locations as MockLocation[]);
          } else if (parsedPlanData) {
            // Show map when plan data is available
            console.log("ChatInterface: Plan data detected, showing map");
            onShowMap([
              { name: "Plan", lat: 0, lng: 0, description: "Travel Plan" },
            ]);
          }
          inputRef.current?.focus();
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
      inputRef.current?.focus();
    }
  }, [
    isLoggedIn,
    threadId,
    conversationId,
    messages,
    input,
    contents,
    onShowMap,
    showDirectionsMode,
  ]);

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
                    <>
                      <FlightTable flights={message.parsedFlights} />
                      {message.content && (
                        <div className="prose prose-sm max-w-none text-gray-800 prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-800 pt-3 p-4">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {index === messages.length - 1 && isLoading
                              ? "..."
                              : message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </>
                  ) : message.parsedPlan ? (
                    <>
                      <PlanDisplay
                        plan={message.parsedPlan}
                        showDirectionsMode={showDirectionsMode}
                      />
                      {message.content && (
                        <div className="prose prose-sm max-w-none text-gray-800 prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-800 pt-3 p-4">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {index === messages.length - 1 && isLoading
                              ? "..."
                              : message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </>
                  ) : message.parsedSelectedFlight ? (
                    <>
                      <FlightTable flights={[message.parsedSelectedFlight]} />
                      {message.content && (
                        <div className="prose prose-sm max-w-none text-gray-800 prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-800 pt-3 p-4">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {index === messages.length - 1 && isLoading
                              ? "..."
                              : message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </>
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
                  Thinking{thinkingDots}
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
            Show Map
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
            ref={inputRef}
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
