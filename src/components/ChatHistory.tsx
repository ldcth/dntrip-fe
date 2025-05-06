import { FC, useCallback, useState, useEffect } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { IUser } from "@/types";
import UserInformation from "./UserInformation";
import { ModelApi } from "../api";
import { IConversation, IContent } from "@/types/conversation.types";

interface ChatHistoryProps {
  isLoggedIn: boolean;
  isExpanded: boolean;
  onToggle: (isExpanded: boolean) => void;
  onNewChat: () => void;
  onSelectConversation: (threadId: string, conversationId: string) => void;
  user?: IUser;
  activeThreadId: string | null;
}

const ChatHistory: FC<ChatHistoryProps> = ({
  user,
  isLoggedIn,
  isExpanded,
  onToggle,
  onNewChat,
  onSelectConversation,
  activeThreadId,
}) => {
  const router = useRouter();
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(true);
      setError(null);
      ModelApi.getConversationUser()
        .then((response) => {
          const convData = Array.isArray(response.data) ? response.data : [];
          const sortedConversations = convData.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setConversations(sortedConversations);
        })
        .catch((err) => {
          console.error("Failed to fetch conversations:", err);
          setError("Failed to load chat history.");
          setConversations([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setConversations([]);
      setError(null);
    }
  }, [isLoggedIn]);

  const handleToggle = () => {
    onToggle(!isExpanded);
  };

  const handleSignIn = useCallback(() => {
    router.push("/login");
  }, [router]);

  const getConversationPreview = (conversation: IConversation): string => {
    const firstUserMessage = conversation.contents?.find(
      (c: IContent) => c.type === "Human"
    )?.content;
    return (
      firstUserMessage ||
      conversation.threadId ||
      `Conversation ${conversation._id}`
    );
  };

  const formatRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30); // Approximate
    const diffYears = Math.floor(diffDays / 365); // Approximate

    if (diffYears > 0)
      return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
    if (diffMonths > 0)
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    if (diffWeeks > 0)
      return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMinutes > 0)
      return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
    return "Just now";
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

      <div className="shrink-0 mb-4 w-full">
        <button
          onClick={onNewChat}
          className={`flex items-center gap-2 w-full px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 cursor-pointer focus:outline-none transition-colors duration-200 ease-in-out ${
            isExpanded ? "justify-start" : "justify-center"
          }`}
          title="New Chat"
        >
          <PlusIcon className="h-5 w-5 shrink-0" />
          {isExpanded && <span className="truncate">New Chat</span>}
        </button>
      </div>

      {isExpanded && (
        <div className="flex-grow overflow-y-auto mb-4 min-h-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">Loading history...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center text-red-600 p-4">
              <ExclamationCircleIcon className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : isLoggedIn && conversations.length > 0 ? (
            <div className="space-y-1">
              {conversations.map((conv) => {
                console.log(
                  `ChatHistory Render Check: Item ThreadID=${
                    conv.threadId
                  }, Active Prop=${activeThreadId}, IsSelected=${
                    conv.threadId === activeThreadId
                  }`
                );
                return (
                  <div
                    key={conv.threadId || conv._id}
                    onClick={() => {
                      console.log(
                        `--- CLICKED History Item: Thread=${conv.threadId}, ConvID=${conv._id} ---`
                      );
                      onSelectConversation(conv.threadId, conv._id);
                    }}
                    className={`p-2 rounded cursor-pointer group ${
                      conv.threadId === activeThreadId
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                    title={getConversationPreview(conv)}
                  >
                    <p
                      className={`text-sm font-medium truncate ${
                        conv.threadId === activeThreadId
                          ? "text-blue-800"
                          : "text-gray-800 group-hover:text-gray-900"
                      }`}
                    >
                      {/* {getConversationPreview(conv)}
                       */}
                      {conv.title}
                    </p>
                    <p
                      className={`text-xs ${
                        conv.threadId === activeThreadId
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-gray-600"
                      }`}
                    >
                      {formatRelativeDate(conv.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : isLoggedIn ? (
            <div className="text-center text-gray-500 py-4">
              No chat history found.
            </div>
          ) : (
            <div className="flex-grow"></div>
          )}
        </div>
      )}

      <div className="shrink-0 mt-auto w-full">
        {isLoggedIn && user ? (
          <UserInformation user={user} isExpanded={isExpanded} />
        ) : isExpanded ? (
          <button
            onClick={handleSignIn}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer focus:outline-none transition-colors duration-200 ease-in-out"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Log In
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ChatHistory;
