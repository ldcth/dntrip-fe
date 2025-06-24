import React from "react";
import {
  ProgressIndicatorProps,
  PROGRESS_MESSAGES,
} from "@/types/progress.types";
import Spinner from "./Spinner";

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  className = "",
  showTimestamp = false,
  useRawMessages = false,
}) => {
  const getSpinnerType = () => {
    if (!progress.isLoading) return "default";

    if (progress.phase === "action" && progress.tool_name) {
      return "tool-spinner";
    }

    if (progress.phase === "call_llm_with_tools") {
      return "ai-spinner";
    }

    return "default";
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return "";

    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getProgressIcon = () => {
    if (progress.error) {
      return <span className="text-red-500 text-lg">⚠️</span>;
    }

    if (!progress.isLoading && progress.phase === "completed") {
      return <span className="text-green-500 text-lg">✅</span>;
    }

    if (progress.isLoading) {
      return <Spinner type={getSpinnerType()} size="small" />;
    }

    return null;
  };

  const getMessageStyle = () => {
    if (progress.error) {
      return "text-red-600 font-medium";
    }

    if (!progress.isLoading && progress.phase === "completed") {
      return "text-green-600 font-medium";
    }

    return "text-gray-700";
  };

  // Get the friendly message from phase mapping or use the raw message from backend
  const getDisplayMessage = () => {
    if (progress.error) {
      return progress.error;
    }

    // If useRawMessages is true, always return the original backend message
    if (useRawMessages) {
      return progress.message;
    }

    // If the backend message contains emojis or looks friendly, use it directly
    const containsEmoji =
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
        progress.message
      );
    if (containsEmoji) {
      return progress.message;
    }

    // Try to map the phase to a friendly message
    if (progress.phase && progress.phase in PROGRESS_MESSAGES) {
      return PROGRESS_MESSAGES[
        progress.phase as keyof typeof PROGRESS_MESSAGES
      ];
    }

    // Try to map tool name to a friendly message (for action phases)
    if (progress.tool_name && progress.tool_name in PROGRESS_MESSAGES) {
      return PROGRESS_MESSAGES[
        progress.tool_name as keyof typeof PROGRESS_MESSAGES
      ];
    }

    // Fallback to the raw message from backend
    return progress.message;
  };

  const displayMessage = getDisplayMessage();

  if (!displayMessage && !progress.error) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm transition-all duration-300 ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Progress Icon/Spinner */}
      <div className="flex-shrink-0">{getProgressIcon()}</div>

      {/* Progress Content */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm ${getMessageStyle()}`}>
            {displayMessage}
          </span>

          {/* Tool Badge */}
          {progress.tool_name && progress.isLoading && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {progress.tool_name}
            </span>
          )}
        </div>

        {/* Timestamp */}
        {showTimestamp && progress.timestamp && (
          <div className="text-xs text-gray-500 mt-1">
            {formatTimestamp(progress.timestamp)}
          </div>
        )}
      </div>

      {/* Connection Status Indicator */}
      <div className="flex-shrink-0">
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
            progress.isConnected
              ? "bg-green-400"
              : progress.error
              ? "bg-red-400"
              : "bg-yellow-400"
          }`}
          title={
            progress.isConnected
              ? "Connected"
              : progress.error
              ? "Error"
              : "Connecting..."
          }
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
