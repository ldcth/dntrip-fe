import { useState, useEffect, useRef } from "react";

interface SimpleProgressState {
  phase: string | null;
  message: string;
  tool_name: string | null;
  isConnected: boolean;
  error: string | null;
}

export const useSimpleSSE = (threadId: string | null) => {
  const [progress, setProgress] = useState<SimpleProgressState>({
    phase: null,
    message: "",
    tool_name: null,
    isConnected: false,
    error: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!threadId) {
      return;
    }

    console.log(`[SimpleSSE] 🔗 Connecting to thread: ${threadId}`);

    // Clean up any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource
    const url = `http://127.0.0.1:3001/api/chat/progress/${threadId}`;
    console.log(`[SimpleSSE] 📡 URL: ${url}`);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // Connection opened
    eventSource.onopen = (event) => {
      console.log(`[SimpleSSE] ✅ CONNECTED!`, event);
      setProgress((prev) => ({
        ...prev,
        isConnected: true,
        error: null,
      }));
    };

    // Message received
    eventSource.onmessage = (event) => {
      console.log(`[SimpleSSE] 📨 RAW MESSAGE:`, event.data);

      try {
        const data = JSON.parse(event.data);
        console.log(`[SimpleSSE] 📨 PARSED:`, data);

        if (data.type === "progress") {
          setProgress((prev) => ({
            ...prev,
            phase: data.phase,
            message: data.message,
            tool_name: data.tool_name || null,
            isConnected: true,
            error: null,
          }));
        } else if (data.type === "connected") {
          console.log(`[SimpleSSE] 🎉 Connection confirmed`);
        }
      } catch (error) {
        console.error(`[SimpleSSE] ❌ Parse error:`, error);
      }
    };

    // Connection error
    eventSource.onerror = (event) => {
      console.error(`[SimpleSSE] ❌ ERROR:`, event);
      console.error(`[SimpleSSE] ❌ ReadyState:`, eventSource.readyState);

      setProgress((prev) => ({
        ...prev,
        isConnected: false,
        error: `Connection error (readyState: ${eventSource.readyState})`,
      }));
    };

    // Cleanup function
    return () => {
      console.log(`[SimpleSSE] 🧹 Cleaning up connection`);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [threadId]);

  return progress;
};
