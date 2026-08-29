import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Crown, X, Zap } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../features/createOrder";
import { verifyPayment } from "../features/verifyPayment";
import getCurrentUser from "../features/getCurrentUser";
import { getErrorMessage } from "../features/errorMessage";
import { setUserdata } from "../redux/userSlice";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "₹199",
    credits: "500 credits",
    perks: ["Priority responses", "All agents unlocked"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    credits: "1,000 credits",
    perks: ["Priority responses", "All agents unlocked", "Extended context"],
    featured: true,
  },
];

function BillingDrawer({ open, onClose }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [pendingPlan, setPendingPlan] = useState(null);
  const [status, setStatus] = useState(null);

  /* Pull the new balance from the server rather than guessing it locally, so
     the sidebar reflects what was actually credited. */
  const refreshUser = async () => {
    const data = await getCurrentUser();
    if (data) dispatch(setUserdata(data));
  };

  const handleUpgrade = async (plan) => {
    if (pendingPlan) return;

    setPendingPlan(plan);
    setStatus(null);

    try {
      /* The checkout script is loaded from index.html; if it was blocked,
         `new window.Razorpay` throws a bare TypeError that used to be
         swallowed, leaving the button looking broken. */
      if (typeof window.Razorpay !== "function") {
        setStatus({
          type: "error",
          message:
            "Payment checkout could not load. Disable blockers and try again.",
        });
        return;
      }

      const data = await createOrder(plan);

      if (!data?.order?.id) {
        setStatus({
          type: "error",
          message: "Could not start checkout. Please try again.",
        });
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "AnkAI",
        description: `${data?.plan?.name || plan} Plan`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await verifyPayment(response);
            await refreshUser();
            setStatus({
              type: "success",
              message: "Payment verified. Your credits have been added.",
            });
          } catch (error) {
            console.error("Payment verification failed:", error);
            setStatus({
              type: "error",
              message: getErrorMessage(
                error,
                "Payment went through but could not be verified. Please contact support."
              ),
            });
          } finally {
            setPendingPlan(null);
          }
        },
        modal: {
          /* Without this the button stays disabled forever when the user
             closes the Razorpay modal. */
          ondismiss: () => setPendingPlan(null),
        },
        theme: { color: "#6f62f0" },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setPendingPlan(null);
        setStatus({
          type: "error",
          message:
            response?.error?.description || "Payment failed. Please try again.",
        });
      });

      razorpay.open();
      return;
    } catch (error) {
      console.error("Upgrade failed:", error);
      setStatus({
        type: "error",
        message: getErrorMessage(error, "Could not start checkout."),
      });
      setPendingPlan(null);
      return;
    }
  };

  const credits = userData?.credits ?? 0;
  const totalCredits = userData?.totalCredits || 100;
  const creditPct =
    totalCredits > 0
      ? Math.max(0, Math.min(100, Math.round((credits / totalCredits) * 100)))
      : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="ankai-app-shell ankai-safe-bottom fixed right-0 top-0 z-[80] flex w-[92vw] max-w-[380px] flex-col border-l border-[var(--ankai-border)] bg-[var(--ankai-sidebar)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--ankai-border-soft)] p-5">
              <div>
                <div className="ankai-display text-[16px] font-semibold text-white">
                  Billing
                </div>
                <div className="text-[12.5px] text-white/35">Plans &amp; credits</div>
              </div>
              <button
                onClick={onClose}
                className="ankai-focus flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-[var(--ankai-border)] bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-white/40">Current plan</p>
                    <h3 className="mt-0.5 text-[18px] font-semibold capitalize text-white">
                      {userData?.plan || "free"}
                    </h3>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10">
                    <Crown size={17} className="text-amber-400" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-[11.5px] text-white/40">
                    <span>Credits</span>
                    <span>
                      {credits}/{totalCredits}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[var(--ankai-accent)] transition-all duration-500"
                      style={{ width: `${creditPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="no-scrollbar flex-1 space-y-3 overflow-auto px-5 pb-5">
              {status && (
                <div
                  className={`rounded-lg border px-3 py-2 text-[12px] ${
                    status.type === "success"
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                      : "border-red-500/25 bg-red-500/10 text-red-200"
                  }`}
                >
                  {status.message}
                </div>
              )}

              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-4 ${
                    plan.featured
                      ? "border-[var(--ankai-accent-border)] bg-[var(--ankai-accent-soft)]"
                      : "border-[var(--ankai-border)]"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-2.5 right-4 flex items-center gap-1 rounded-full bg-[var(--ankai-accent)] px-2 py-0.5 text-[10px] font-semibold text-white">
                      <Zap size={10} /> Popular
                    </span>
                  )}

                  <h3 className="text-[14.5px] font-semibold text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-[24px] font-bold text-white">
                    {plan.price}
                    <span className="text-[12px] font-normal text-white/35">
                      {" "}
                      /one-time
                    </span>
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-white/40">
                    {plan.credits}
                  </p>

                  <ul className="mt-3 space-y-1.5">
                    {plan.perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-center gap-2 text-[12px] text-white/55"
                      >
                        <Check size={13} className="text-[var(--ankai-accent-text)]" />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={Boolean(pendingPlan)}
                    className={`ankai-focus mt-4 w-full rounded-lg py-2.5 text-[13px] font-semibold transition disabled:opacity-60 ${
                      plan.featured
                        ? "bg-[var(--ankai-accent)] text-white hover:bg-[var(--ankai-accent-hover)]"
                        : "border border-[var(--ankai-border)] text-white/85 hover:bg-white/[0.06]"
                    }`}
                  >
                    {pendingPlan === plan.id ? "Opening checkout…" : "Upgrade"}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BillingDrawer;
