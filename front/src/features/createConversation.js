import api from "../../utils/axios";

/* Returns the created conversation, or null when the request failed.
   Callers must handle null - pushing a non-conversation into Redux used to
   produce sidebar entries with no _id. */
export const createConversation = async () => {
  try {
    const { data } = await api.get("/api/chat/create-conversation");
    return data?._id ? data : null;
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return null;
  }
};
