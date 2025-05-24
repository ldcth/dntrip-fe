import createWebStorage from "redux-persist/lib/storage/createWebStorage";

// Dummy storage implementation for environments where localStorage is not available (SSR)
const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string | null, value: unknown) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

// Create storage based on environment
const storage =
  typeof window !== "undefined"
    ? createWebStorage("local") // Use localStorage if window is defined (browser)
    : createNoopStorage(); // Use dummy storage if window is undefined (server)

export default storage;
