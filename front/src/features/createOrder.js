import api from "../../utils/axios";

/* Throws so the billing drawer can tell the user why checkout
   never opened instead of silently doing nothing. */
export const createOrder = async (plan) => {
  const { data } = await api.post("/api/billing/create", { plan });
  return data;
};
