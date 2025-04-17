import { Message } from "../types/chat";

export const formatMessage = (
  role: "user" | "assistant",
  content: string
): Message => {
  return {
    role,
    content,
  };
};

export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};
