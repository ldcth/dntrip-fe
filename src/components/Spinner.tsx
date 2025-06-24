import React from "react";
import { SpinnerProps } from "@/types/progress.types";

const Spinner: React.FC<SpinnerProps> = ({
  type = "default",
  size = "medium",
  className = "",
}) => {
  const getSpinnerClasses = () => {
    const baseClasses =
      "inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]";

    // Size classes
    const sizeClasses = {
      small: "h-4 w-4 border-2",
      medium: "h-6 w-6 border-2",
      large: "h-8 w-8 border-[3px]",
    };

    // Type-specific classes
    const typeClasses = {
      default: "text-blue-500",
      "ai-spinner": "text-purple-500",
      "tool-spinner": "text-green-500",
    };

    return `${baseClasses} ${sizeClasses[size]} ${typeClasses[type]} ${className}`;
  };

  const getSpinnerIcon = () => {
    switch (type) {
      case "ai-spinner":
        return (
          <div className="relative">
            <div className={getSpinnerClasses()} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs">🤖</span>
            </div>
          </div>
        );
      case "tool-spinner":
        return (
          <div className="relative">
            <div className={getSpinnerClasses()} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs">⚙️</span>
            </div>
          </div>
        );
      default:
        return (
          <div
            className={getSpinnerClasses()}
            role="status"
            aria-label="Loading"
          />
        );
    }
  };

  return (
    <div className="inline-flex items-center justify-center">
      {getSpinnerIcon()}
    </div>
  );
};

export default Spinner;
