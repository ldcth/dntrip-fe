export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
