import api from "../../utils/axios";

export const updateConversation = async (payload) => {
  try {
    const { data } = await api.post("/api/chat/update-conversation", payload);
    return data;
  } catch (error) {
    /* A failed rename must not block the message that triggered it. */
    console.error("Failed to update conversation:", error);
    return null;
  }
};
