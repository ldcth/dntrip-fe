// import { IConversation } from "@/types";

import { IConversation } from "@/types/conversation.types";
import instance from "./axios";

type Question = {
  question: string;
  thread_id?: string;
  conversationId?: string;
};

const getAnswerByCustomer = (data: Question) => {
  // return instance.post("/ask", data);
  return instance.post("/chat", data);
};
const getAnswerByUser = (data: Question) => {
  return instance.post("/user/chat", data);
};
const getConversationUser = () => {
  return instance.get<IConversation[]>("/user/conversation");
};
const getConversationContent = (id: string) => {
  return instance.get(`/user/conversation/${id}`);
};
export const ModelApi = {
  getAnswerByUser,
  getAnswerByCustomer,
  getConversationUser,
  getConversationContent,
};
