import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "@/types";
import { RootState } from "@/redux/store";
import { setHeaderConfigAxios } from "@/api/axios";

export type AuthState = {
  loggedIn: boolean;
  user?: IUser;
  access_token?: string;
};

const initialState: AuthState = {
  loggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.loggedIn = true;
      state.user = action.payload;
    },
    setCredential: (state, action: PayloadAction<string>) => {
      state.loggedIn = true;
      state.access_token = action.payload;
    },
    logout: (state, action: PayloadAction) => {
      setHeaderConfigAxios();
      state.loggedIn = false;
      state.user = undefined;
      state.access_token = undefined;
    },
  },
});

export const authSelector = (state: RootState) => state.auth;

export const { logout, setUser, setCredential } = authSlice.actions;
export default authSlice.reducer;
