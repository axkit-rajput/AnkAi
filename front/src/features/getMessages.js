import api from "../../utils/axios";

async function getMessages(id) {
  if (!id) return [];

  const { data } = await api.get(`/api/chat/get-messages/${id}`);
  return Array.isArray(data) ? data : [];
}

export default getMessages;
