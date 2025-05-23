import { FC, useCallback, useState, useEffect } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  ExclamationCircleIcon,
  PencilIcon,
  CreditCardIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { IUser } from "@/types";
import UserInformation from "./UserInformation";
import {
  IConversation,
  IContent,
  AiResponseType,
} from "@/types/conversation.types";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";

interface ChatHistoryProps {
  isLoggedIn: boolean;
  isExpanded: boolean;
  onToggle: (isExpanded: boolean) => void;
  onNewChat: () => void;
  onSelectConversation: (conversationId: string) => void;
  user?: IUser;
  activeConversationId: string | null;
  conversations: IConversation[];
  isLoading: boolean;
  error: string | null;
}

const ChatHistory: FC<ChatHistoryProps> = ({
  isLoggedIn,
  isExpanded,
  onToggle,
  onNewChat,
  onSelectConversation,
  activeConversationId,
  conversations,
  isLoading,
  error,
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    onToggle(!isExpanded);
  };

  const handleSignIn = useCallback(() => {
    router.push("/login");
  }, [router]);

  const handleModifyName = (conversationId: string) => {
    alert(`Modify Name clicked for conversation: ${conversationId}`);
  };

  const handleBilling = (conversationId: string) => {
    alert(`Billing clicked for conversation: ${conversationId}`);
  };

  const handleDelete = (conversationId: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete conversation ${conversationId}?`
      )
    ) {
      alert(`Delete confirmed for conversation: ${conversationId}`);
    }
  };

  const getConversationPreview = (conversation: IConversation): string => {
    if (conversation.title) {
      return conversation.title;
    }

    const firstHumanMessageContent = conversation.contents?.find(
      (c: IContent) => c.type === "Human"
    )?.content;

    if (typeof firstHumanMessageContent === "string") {
      return firstHumanMessageContent;
    }

    const firstAiMessage = conversation.contents?.find(
      (c: IContent) => c.type === "AI"
    );

    if (firstAiMessage) {
      const aiContent = firstAiMessage.content; // This is AiResponseType | string
      if (
        typeof aiContent === "object" &&
        aiContent !== null &&
        "message" in aiContent
      ) {
        if (typeof (aiContent as AiResponseType).message === "string") {
          return (aiContent as AiResponseType).message!;
        }
      }
    }

    if (conversation.threadId) {
      return `Chat: ${conversation.threadId.substring(0, 8)}...`;
    }

    return `Conversation ${conversation._id.substring(0, 8)}...`;
  };

  const formatRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

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

  if (!mounted) {
    return (
      <div
        className={`flex flex-col h-full p-4 transition-all duration-300 ease-in-out ${
          isExpanded ? "w-full" : "w-16"
        }`}
      >
        {/* Placeholder for the header section to maintain layout consistency */}
        <div
          className={`flex ${
            isExpanded ? "justify-between" : "justify-center"
          } items-center mb-4 shrink-0`}
        >
          {isExpanded && (
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          )}
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="shrink-0 mb-4 w-full">
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
        {/* Minimal structure for the rest, or simply null if preferred */}
      </div>
    );
  }

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
                const preview = getConversationPreview(conv);
                const menuItems: MenuProps["items"] = [
                  {
                    key: "modify-name",
                    label: (
                      <span className="flex items-center">
                        <PencilIcon className="h-4 w-4 mr-2" /> Modify Name
                      </span>
                    ),
                    onClick: () => handleModifyName(conv._id),
                  },
                  {
                    key: "billing",
                    label: (
                      <span className="flex items-center">
                        <CreditCardIcon className="h-4 w-4 mr-2" /> Billing
                      </span>
                    ),
                    onClick: () => handleBilling(conv._id),
                  },
                  {
                    key: "delete",
                    label: (
                      <span className="flex items-center text-red-600">
                        <TrashIcon className="h-4 w-4 mr-2" /> Delete
                      </span>
                    ),
                    onClick: () => handleDelete(conv._id),
                  },
                ];

                return (
                  <Dropdown
                    key={conv._id}
                    menu={{ items: menuItems }}
                    trigger={["contextMenu"]}
                  >
                    <div
                      onClick={() => {
                        onSelectConversation(conv._id);
                      }}
                      className={`p-2 rounded cursor-pointer group ${
                        conv._id === activeConversationId
                          ? "bg-blue-100"
                          : "hover:bg-gray-100"
                      }`}
                      title={preview}
                    >
                      <p
                        className={`text-sm font-medium truncate ${
                          conv._id === activeConversationId
                            ? "text-blue-800"
                            : "text-gray-800 group-hover:text-gray-900"
                        }`}
                      >
                        {preview}
                      </p>
                      <p
                        className={`text-xs ${
                          conv._id === activeConversationId
                            ? "text-blue-600"
                            : "text-gray-500 group-hover:text-gray-600"
                        }`}
                      >
                        {formatRelativeDate(conv.createdAt)}
                      </p>
                    </div>
                  </Dropdown>
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
        {isLoggedIn && <UserInformation />}
        {!isLoggedIn && isExpanded && (
          <button
            onClick={handleSignIn}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer focus:outline-none transition-colors duration-200 ease-in-out"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Log In
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
