export interface IConversation {
  _id: string;
  contents: string[];
  createdAt: string;
  title: string;
  updatedAt: string;
  userId: string;
  threadId: string;
}

export interface IContent {
  _id: string;
  conversationId: string;
  threadId: string;
  content: string | object;
  type: "Human" | "AI";
  intent: string;
  createdAt: string;
  updatedAt: string;
}
