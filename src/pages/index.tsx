import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatHistory from "../components/ChatHistory";
import ChatInterface, { MockLocation } from "../components/ChatInterface";
import MapVis from "../components/MapVis";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { ImperativePanelHandle } from "react-resizable-panels";

const SESSION_STORAGE_THREAD_KEY = "chatThreadId";

export default function Home() {
  const [showMap, setShowMap] = useState(false);
  const [isLoggedIn] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [threadId, setThreadId] = useState<string | null>(null);

  const historyPanelRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    let currentThreadId = sessionStorage.getItem(SESSION_STORAGE_THREAD_KEY);
    if (!currentThreadId) {
      currentThreadId = uuidv4();
      sessionStorage.setItem(SESSION_STORAGE_THREAD_KEY, currentThreadId);
    }
    setThreadId(currentThreadId);
  }, []);

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
    if (
      window.confirm(
        "Are you sure you want to start a new chat? This will clear the current conversation."
      )
    ) {
      const newThreadId = uuidv4();
      setThreadId(newThreadId);
      sessionStorage.setItem(SESSION_STORAGE_THREAD_KEY, newThreadId);
      setShowMap(false);
      setIsHistoryExpanded(true);
      console.log("Confirmed: Started new chat with thread ID:", newThreadId);
    } else {
      console.log("Cancelled: New chat action was cancelled by user.");
    }
  };

  const resizeHandleStyle = `w-2 bg-gray-200 hover:bg-blue-500 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 ease-in-out flex items-center justify-center border-x border-gray-300`;

  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      <PanelGroup direction="horizontal" autoSaveId="mainLayout">
        <Panel
          ref={historyPanelRef}
          defaultSize={25}
          minSize={5}
          collapsible={true}
          collapsedSize={0}
          onCollapse={() => {
            setIsHistoryExpanded(false);
          }}
          onExpand={() => {
            setIsHistoryExpanded(true);
          }}
          className="bg-white !overflow-y-auto"
          order={1}
        >
          <ChatHistory
            isLoggedIn={isLoggedIn}
            onToggle={handleHistoryToggle}
            onNewChat={handleNewChat}
            isExpanded={isHistoryExpanded}
          />
        </Panel>

        <PanelResizeHandle className={resizeHandleStyle} />

        <Panel
          defaultSize={showMap ? 45 : 75}
          minSize={30}
          className="flex flex-col bg-gray-100 !overflow-hidden"
          order={2}
        >
          <div className="flex-1 overflow-y-auto">
            {threadId && (
              <ChatInterface
                onShowMap={handleShowMap}
                isLoggedIn={isLoggedIn}
                threadId={threadId}
              />
            )}
          </div>
        </Panel>

        {showMap && (
          <>
            <PanelResizeHandle className={resizeHandleStyle} />
            <Panel
              defaultSize={30}
              minSize={15}
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
