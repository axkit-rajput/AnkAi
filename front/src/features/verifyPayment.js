import api from "../../utils/axios";

/* Throws on failure: a payment that Razorpay accepted but the server
   could not verify must be reported, not swallowed. */
export const verifyPayment = async (payload) => {
  const { data } = await api.post("/api/billing/verify", payload);
  return data;
};
