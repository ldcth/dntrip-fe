import { BASE_URL } from "@/config";
import axios, { AxiosResponse, AxiosError } from "axios";

const baseURL = `${BASE_URL}/api`;

const instance = axios.create({
  baseURL: baseURL,
  // Các cấu hình khác của Axios
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "ngrok-skip-browser-warning": "true",
  },
});

const handleSuccessResponse = (response: AxiosResponse) => {
  return response;
};

const handleErrorResponse = (error: AxiosError) => {
  try {
    // console.log("here");
    if (error.response && error.response.data) {
      console.error("API Error Response:", error.response.data);
      return Promise.reject(error.response.data);
    } else {
      console.error("API Error (No Response Data):", error.message);
      return Promise.reject({ message: error.message || "Network Error" });
    }
  } catch (e) {
    console.error("Error handling API error:", e);
    return Promise.reject({ message: "Network Error or Error Handler Failed" });
  }
};

export const setHeaderConfigAxios = (token?: string) => {
  if (token) {
    console.log("axios.ts: Setting Authorization header with token:", token);
    instance.defaults.headers.common["Authorization"] = token
      ? "Bearer " + token
      : "";
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
};

instance.interceptors.response.use(handleSuccessResponse, handleErrorResponse);

export default instance;
