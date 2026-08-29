import api from "../../utils/axios";

export const getConversations = async () => {
  const { data } = await api.get("/api/chat/get-conversations");
  return Array.isArray(data) ? data : [];
};
