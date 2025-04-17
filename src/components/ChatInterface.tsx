import { FC, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModelApi } from "../api";

interface Location {
  // Define Location properties if not already defined elsewhere
  latitude: number;
  longitude: number;
  name?: string;
}

interface ChatInterfaceProps {
  onShowMap: (locations: Location[]) => void;
  isLoggedIn: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatInterface: FC<ChatInterfaceProps> = ({ onShowMap }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const streamingMessageRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    // Use smooth scrolling for better UX
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to scroll down when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect for cleaning up streaming timeout on unmount
  useEffect(() => {
    return () => {
      if (streamingMessageRef.current) {
        clearTimeout(streamingMessageRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user" as const, content: trimmedInput },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true); // Show loading indicator initially

    // --- Clear previous streaming timeout if any ---
    if (streamingMessageRef.current) {
      clearTimeout(streamingMessageRef.current);
    }

    try {
      const response = await ModelApi.getAnswerByUser({
        question: trimmedInput,
      });
      const fullResponseContent = response.data.response;

      const finalMessages = [
        ...newMessages,
        { role: "assistant" as const, content: "" }, // Add placeholder
      ];
      setMessages(finalMessages);

      // --- Hide loading indicator *before* starting stream ---
      setIsLoading(false);

      let currentContent = "";
      const words = fullResponseContent.split(/(\s+)/);
      let wordIndex = 0;

      const streamNextWord = () => {
        if (wordIndex < words.length) {
          currentContent += words[wordIndex];
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = {
              ...updatedMessages[updatedMessages.length - 1],
              content: currentContent,
            };
            return updatedMessages;
          });
          wordIndex++;
          // --- Scroll after each word update during streaming ---
          // We trigger scrollToBottom via the useEffect[messages] dependency,
          // but an explicit call might be needed if useEffect timing isn't perfect.
          // Let's rely on useEffect first, add explicit call if needed.
          // scrollToBottom();

          streamingMessageRef.current = setTimeout(streamNextWord, 30);
        } else {
          // Streaming finished, ensure final scroll
          scrollToBottom();
          if (response.data.locations && response.data.locations.length > 0) {
            onShowMap(response.data.locations);
          }
        }
      };

      // Start the streaming
      streamNextWord();
    } catch (error) {
      console.error("Error:", error);
      if (streamingMessageRef.current) {
        clearTimeout(streamingMessageRef.current);
      }
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove placeholder message on error
        {
          role: "assistant" as const,
          content:
            "Sorry, there was an error processing your request. Please try again.",
        },
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
              <p className="text-gray-600">
                Ask me anything about travel destinations, itineraries, or
                recommendations!
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
                      : "bg-white text-gray-800"
                  }`}
                >
                  {message.role === "user" ? (
                    message.content // User message as plain text
                  ) : (
                    // Assistant message rendered with Markdown
                    <div className="prose prose-sm max-w-none text-gray-800 prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-strong:font-semibold">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Thinking indicator display logic */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-xl px-4 py-3 bg-white text-gray-500 shadow-md">
                  Thinking...
                </div>
              </div>
            )}
            {/* Invisible div to target for scrolling */}
            <div ref={messagesEndRef} style={{ height: "1px" }} />
          </>
        )}
      </div>
      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-gray-100">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about travel..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 transition duration-150 ease-in-out disabled:bg-gray-200"
            disabled={isLoading} // Disable input while processing OR streaming (technically isLoading is false during streaming, but we might want to disable until full response? Let's keep it disabled only when strictly loading)
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            disabled={isLoading || !input.trim()} // Disable if loading OR input is empty
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
