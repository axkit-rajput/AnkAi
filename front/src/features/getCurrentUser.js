import api from "../../utils/axios";

/* Resolves to the session user, or null when there is no valid session.
   A 401 here is the normal "not logged in" case, not an error worth logging. */
const getCurrentUser = async () => {
  try {
    const { data } = await api.get("/api/me");
    return data?.userId ? data : null;
  } catch (error) {
    if (error?.response?.status !== 401) {
      console.error("Failed to load current user:", error);
    }
    return null;
  }
};

export default getCurrentUser;
