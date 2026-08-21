import api from "../../utils/axios";

export const getConversations = async () => {
  try {
    const response = await api.get("/api/chat/get-conversations");

    console.log("GET CONVERSATIONS STATUS:", response.status);
    console.log("GET CONVERSATIONS DATA:", response.data);

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("GET CONVERSATIONS FAILED");

    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    console.error("Message:", error.message);
    
    throw error;
  }
};