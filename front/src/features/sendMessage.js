import api from "../../utils/axios";

/* Throws on failure so the caller can surface the real reason
   (rate limits, out of credits, network errors) to the user. */
async function sendMessage(payload) {
  const { data } = await api.post("/api/agent/chat", payload);
  return data;
}

export default sendMessage;
