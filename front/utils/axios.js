import axios from "axios";

import { store } from "../src/redux/store";
import { setUserdata } from "../src/redux/userSlice";
import { resetConversations } from "../src/redux/conversationSlice";
import { clearChat } from "../src/redux/messageSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

/* Sessions expire after 7 days. Without this the app kept rendering a signed-in
   shell whose every request failed, with no way back to the sign-in prompt. */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    /* /api/me returning 401 is the normal "not signed in" probe - App handles
       that itself, and reacting here would wipe state on every cold load. */
    if (status === 401 && !url.includes("/api/me")) {
      const { user } = store.getState();

      if (user?.userData) {
        store.dispatch(setUserdata(null));
        store.dispatch(resetConversations());
        store.dispatch(clearChat());
      }
    }

    return Promise.reject(error);
  }
);

export default api;
