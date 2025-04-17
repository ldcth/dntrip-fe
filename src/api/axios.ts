import { BASE_URL } from "@/config";
import axios, { AxiosResponse } from "axios";

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

const handleSuccessResponse = (response: AxiosResponse<any, any>) => {
  return response;
};

const handleErrorResponse = (error: any) => {
  try {
    // console.log("here");
    return Promise.reject(error.response.data);
  } catch (e) {
    return Promise.reject({ message: "Network Error" });
  }
};

export const setHeaderConfigAxios = (token?: string) => {
  if (token) {
    instance.defaults.headers.common["Authorization"] = token
      ? "Bearer " + token
      : "";
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
};

instance.interceptors.response.use(handleSuccessResponse, handleErrorResponse);

export default instance;
