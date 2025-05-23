import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor, RootState } from "../redux/store/store";
import { useEffect } from "react";
import { setHeaderConfigAxios } from "@/api/axios";

// Component to handle auth header logic after rehydration
const AuthHeaderSetter = () => {
  const token = useSelector((state: RootState) => state.auth.access_token);
  const loggedIn = useSelector((state: RootState) => state.auth.loggedIn);

  useEffect(() => {
    if (loggedIn && token) {
      console.log("_app.tsx: Persisted token found, setting Axios header.");
      setHeaderConfigAxios(token);
    } else {
      console.log(
        "_app.tsx: No persisted token or not logged in, ensuring Axios header is clear."
      );
      setHeaderConfigAxios();
    }
  }, [token, loggedIn]);

  return null;
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {() => (
          <>
            <AuthHeaderSetter />
            <Component {...pageProps} />
          </>
        )}
      </PersistGate>
    </Provider>
  );
}
