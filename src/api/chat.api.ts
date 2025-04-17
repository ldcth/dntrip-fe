import { IConversation } from "@/types";

import instance from "./axios";

type Question = {
  question: string;
};

const getAnswerByUser = (data: Question) => {
  // return instance.post("/ask", data);
  return instance.post("/travel", data);
};

export const ModelApi = {
  getAnswerByUser,
};
