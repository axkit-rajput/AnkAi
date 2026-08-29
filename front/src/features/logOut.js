import api from "../../utils/axios";

async function logOut() {
  try {
    await api.get("/api/auth/logout");
  } catch (error) {
    /* The local session is cleared either way. */
    console.error("Logout request failed:", error);
  }
}

export default logOut;
