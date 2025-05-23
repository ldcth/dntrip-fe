import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";
import ChatHistory from "../components/ChatHistory";
import ChatInterface /*, { MockLocation } */ from "../components/ChatInterface";
import MapVis from "../components/MapVis";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { authSelector } from "@/redux/reducers";
import { useSelector } from "react-redux";
import Header from "@/components/Header";
import { ModelApi } from "@/api";
import { IConversation, MockLocation } from "@/types/conversation.types";

const SESSION_STORAGE_NEW_THREAD_KEY = "chatNewThreadId";

export default function ChatPage() {
  const router = useRouter();
  const { user, loggedIn } = useSelector(authSelector);

  const [showMap, setShowMap] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

  const [threadId, setThreadId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [highlightedConversationId, setHighlightedConversationId] = useState<
    string | null
  >(null);

  // State for conversation list
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [conversationsLoading, setConversationsLoading] =
    useState<boolean>(false);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null
  );

  const [showDirectionsMode, setShowDirectionsMode] = useState(false);
  const historyPanelRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    if (loggedIn) {
      setConversationsLoading(true);
      setConversationsError(null);
      ModelApi.getConversationUser()
        .then((response) => {
          const convData = Array.isArray(response.data) ? response.data : [];
          const sortedConversations = convData.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setConversations(sortedConversations);
          console.log("ChatPage: Fetched conversations:", sortedConversations);
        })
        .catch((err) => {
          console.error(
            "ChatPage: Failed to fetch conversations DETAILED:",
            err
          );
          if (err.response) {
            console.error("ChatPage: Error response data:", err.response.data);
            console.error(
              "ChatPage: Error response status:",
              err.response.status
            );
            console.error(
              "ChatPage: Error response headers:",
              err.response.headers
            );
          }
          setConversationsError(
            "Failed to load chat history. Check console for details."
          );
          setConversations([]);
        })
        .finally(() => {
          setConversationsLoading(false);
        });
    } else {
      setConversations([]);
      setConversationId(null);
      setHighlightedConversationId(null);

      const newThread = uuidv4();
      setThreadId(newThread);
      sessionStorage.setItem(SESSION_STORAGE_NEW_THREAD_KEY, newThread);
      console.log(
        "ChatPage: User logged out or guest, set new threadId:",
        newThread
      );
    }
  }, [loggedIn]);

  useEffect(() => {
    if (!router.isReady || (loggedIn && conversationsLoading)) {
      return;
    }

    const queryConvId = router.query.id as string | undefined;

    if (queryConvId) {
      if (loggedIn) {
        const foundConversation = conversations.find(
          (c) => c._id === queryConvId
        );
        if (foundConversation) {
          setConversationId(foundConversation._id);
          setThreadId(foundConversation.threadId);
          setHighlightedConversationId(foundConversation._id);
          sessionStorage.removeItem(SESSION_STORAGE_NEW_THREAD_KEY);
          console.log(
            "ChatPage: Loaded conversation from URL:",
            foundConversation
          );
        } else {
          if (!conversationsLoading) {
            console.warn(
              `ChatPage: Conversation with ID ${queryConvId} not found. Redirecting to /chat.`
            );
            router.replace("/chat", undefined, { shallow: true });
          }
        }
      } else {
        console.warn(
          "ChatPage: Logged out but conversation ID in URL. Redirecting to /chat."
        );
        router.replace("/chat", undefined, { shallow: true });
      }
    } else {
      setConversationId(null);
      setHighlightedConversationId(null);
      let newOrExistingThreadId = sessionStorage.getItem(
        SESSION_STORAGE_NEW_THREAD_KEY
      );
      if (!newOrExistingThreadId) {
        newOrExistingThreadId = uuidv4();
        sessionStorage.setItem(
          SESSION_STORAGE_NEW_THREAD_KEY,
          newOrExistingThreadId
        );
      }
      setThreadId(newOrExistingThreadId);
      console.log(
        "ChatPage: No conversation ID in URL, using/creating threadId for new chat:",
        newOrExistingThreadId
      );
    }
  }, [
    router.isReady,
    router.query.id,
    loggedIn,
    conversations,
    conversationsLoading,
    router,
  ]);

  useEffect(() => {
    const panel = historyPanelRef.current;
    if (panel) {
      const currentlyCollapsed = panel.isCollapsed();
      if (isHistoryExpanded && currentlyCollapsed) {
        panel.expand();
      } else if (!isHistoryExpanded && !currentlyCollapsed) {
        panel.collapse();
      }
    }
  }, [isHistoryExpanded]);

  const handleShowMap = (locations: MockLocation[]) => {
    setShowMap(locations && locations.length > 0);
  };
  const handleHistoryToggle = (isExpanded: boolean) => {
    setIsHistoryExpanded(isExpanded);
  };

  const handleNewChat = () => {
    if (window.confirm("Are you sure you want to start a new chat?")) {
      setShowMap(false);

      if (!loggedIn) {
        const newThread = uuidv4();
        setThreadId(newThread);
        sessionStorage.setItem(SESSION_STORAGE_NEW_THREAD_KEY, newThread);
        setConversationId(null);
        setHighlightedConversationId(null);
        console.log(
          "ChatPage: Logged-out user initiated new chat with thread ID:",
          newThread
        );
        if (router.pathname !== "/chat" || router.query.id) {
          router.push("/chat", undefined, { shallow: true });
        }
      } else {
        router.push("/chat", undefined, { shallow: true });
      }
      console.log("ChatPage: New chat session initiated.");
    } else {
      console.log("ChatPage: New chat action cancelled.");
    }
  };

  const handleSelectConversation = (selectedConvId: string) => {
    console.log(`ChatPage: Selecting conversation via URL: ${selectedConvId}`);
    router.push(`/chat?id=${selectedConvId}`, undefined, { shallow: true });
    setShowMap(false);
  };

  const resizeHandleStyle = `w-2 bg-gray-200 hover:bg-blue-500 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 ease-in-out flex items-center justify-center border-x border-gray-300 cursor-col-resize`;

  const chatInterfaceKey = conversationId || threadId || "chat-interface";

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-grow bg-gray-100 overflow-hidden flex">
        <PanelGroup direction="horizontal" autoSaveId="mainLayout">
          <Panel
            ref={historyPanelRef}
            defaultSize={15}
            minSize={loggedIn ? 5 : 0}
            maxSize={25}
            collapsible={true}
            collapsedSize={isHistoryExpanded ? 5 : 0}
            onCollapse={() => {
              if (isHistoryExpanded) setIsHistoryExpanded(false);
            }}
            onExpand={() => {
              if (!isHistoryExpanded) setIsHistoryExpanded(true);
            }}
            className="bg-white !overflow-y-auto flex flex-col"
            order={1}
          >
            <ChatHistory
              isLoggedIn={loggedIn}
              user={user}
              onToggle={handleHistoryToggle}
              onNewChat={handleNewChat}
              onSelectConversation={handleSelectConversation}
              isExpanded={isHistoryExpanded}
              conversations={conversations}
              isLoading={conversationsLoading}
              error={conversationsError}
              activeConversationId={highlightedConversationId}
            />
          </Panel>

          <PanelResizeHandle className={resizeHandleStyle} />

          <Panel
            defaultSize={showMap ? 45 : isHistoryExpanded ? 55 : 75}
            minSize={30}
            className="flex flex-col bg-gray-100 !overflow-hidden"
            order={2}
          >
            <div className="flex-1 overflow-y-auto">
              {threadId ? (
                <ChatInterface
                  key={chatInterfaceKey}
                  onShowMap={handleShowMap}
                  isLoggedIn={loggedIn}
                  threadId={threadId}
                  conversationId={conversationId}
                  showDirectionsMode={showDirectionsMode}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  {loggedIn && conversationsLoading
                    ? "Loading chat..."
                    : "Select a conversation or start a new chat."}
                </div>
              )}
            </div>
          </Panel>

          {showMap && (
            <>
              <PanelResizeHandle className={resizeHandleStyle} />
              <Panel
                defaultSize={30}
                minSize={15}
                maxSize={50}
                collapsible={true}
                className="bg-white !overflow-y-auto"
                order={3}
              >
                <MapVis
                  showDirectionsMode={showDirectionsMode}
                  setShowDirectionsMode={setShowDirectionsMode}
                  threadId={threadId}
                />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  );
}
