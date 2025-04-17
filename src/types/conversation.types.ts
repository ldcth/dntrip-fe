export interface IConversation {
  _id: string;
  contents: string[];
  createdAt: string;
  title: string;
  updatedAt: string;
  userId: string;
}

export interface IContent {
  _id: string;
  answers: string[];
  conversationId: string;
  correct_answer: string;
  createdAt: string;
  version: number;
  type: "ask" | "answer";
  updatedAt: string;
}
