import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatHistory from "../components/ChatHistory";
import ChatInterface, { MockLocation } from "../components/ChatInterface";
import MapVis from "../components/MapVis";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { authSelector } from "@/redux/reducers";
import { useSelector } from "react-redux";

// Session storage keys
const SESSION_STORAGE_THREAD_KEY = "chatThreadId";
const SESSION_STORAGE_CONV_KEY = "chatConversationId"; // Key for conversation ID

export default function Home() {
  const [showMap, setShowMap] = useState(false);
  const { user, loggedIn } = useSelector(authSelector);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  // Initialize state from sessionStorage or defaults
  const [threadId, setThreadId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  // State for VISUAL highlighting - only set on explicit click
  const [highlightedThreadId, setHighlightedThreadId] = useState<string | null>(
    null
  );

  const historyPanelRef = useRef<ImperativePanelHandle>(null);

  // Effect to initialize state from sessionStorage on mount
  useEffect(() => {
    let initialThreadId = sessionStorage.getItem(SESSION_STORAGE_THREAD_KEY);
    let initialConvId = sessionStorage.getItem(SESSION_STORAGE_CONV_KEY);

    if (!initialThreadId) {
      // If no threadId, start completely fresh
      initialThreadId = uuidv4();
      initialConvId = null; // No conversation for a new thread
      sessionStorage.setItem(SESSION_STORAGE_THREAD_KEY, initialThreadId);
      sessionStorage.removeItem(SESSION_STORAGE_CONV_KEY); // Ensure old convId is removed
      console.log(
        "Home: No session found, created new thread:",
        initialThreadId
      );
    } else {
      // If threadId exists, use stored convId (which might be null if last state was new chat)
      console.log(
        "Home: Loaded from session - Thread:",
        initialThreadId,
        "Conv:",
        initialConvId
      );
    }

    setThreadId(initialThreadId);
    setConversationId(initialConvId);
    setHighlightedThreadId(null); // IMPORTANT: Do NOT highlight on initial load

    // Run only once on initial mount
  }, []);

  // useEffect for panel resize (no change)
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

  // handleShowMap, handleHistoryToggle (no change)
  const handleShowMap = (locations: MockLocation[]) => {
    setShowMap(locations && locations.length > 0);
  };
  const handleHistoryToggle = (isExpanded: boolean) => {
    setIsHistoryExpanded(isExpanded);
  };

  // Update handleNewChat: clear highlighted ID
  const handleNewChat = () => {
    if (window.confirm("Are you sure you want to start a new chat?")) {
      const newThreadId = uuidv4();
      setThreadId(newThreadId);
      setConversationId(null);
      setHighlightedThreadId(null); // Clear highlight
      sessionStorage.setItem(SESSION_STORAGE_THREAD_KEY, newThreadId);
      sessionStorage.removeItem(SESSION_STORAGE_CONV_KEY); // Remove convId from storage
      setShowMap(false);
      setIsHistoryExpanded(true);
      console.log("Confirmed: Started new chat with thread ID:", newThreadId);
    } else {
      console.log("Cancelled: New chat action.");
    }
  };

  // Update handleSelectConversation: set highlighted ID on click
  const handleSelectConversation = (
    selectedThreadId: string,
    selectedConversationId: string
  ) => {
    console.log(
      `Home: Selecting conversation. Thread: ${selectedThreadId}, ConvID: ${selectedConversationId}`
    );
    setThreadId(selectedThreadId);
    setConversationId(selectedConversationId);
    setHighlightedThreadId(selectedThreadId); // Set this thread for highlighting
    sessionStorage.setItem(SESSION_STORAGE_THREAD_KEY, selectedThreadId);
    sessionStorage.setItem(SESSION_STORAGE_CONV_KEY, selectedConversationId); // Store convId
    setShowMap(false);
  };

  const resizeHandleStyle = `w-2 bg-gray-200 hover:bg-blue-500 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 ease-in-out flex items-center justify-center border-x border-gray-300 cursor-col-resize`;

  return (
    <div className="h-screen bg-gray-100 overflow-hidden flex">
      <PanelGroup direction="horizontal" autoSaveId="mainLayout">
        <Panel
          ref={historyPanelRef}
          defaultSize={20}
          minSize={loggedIn ? 5 : 0}
          maxSize={40}
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
            activeThreadId={highlightedThreadId}
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
                key={threadId}
                onShowMap={handleShowMap}
                isLoggedIn={loggedIn}
                threadId={threadId}
                conversationId={conversationId}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation or start a new chat.
              </div>
            )}
          </div>
        </Panel>

        {showMap && (
          <>
            <PanelResizeHandle className={resizeHandleStyle} />
            <Panel
              defaultSize={35}
              minSize={15}
              maxSize={50}
              collapsible={true}
              className="bg-white !overflow-y-auto"
              order={3}
            >
              <MapVis />
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}
