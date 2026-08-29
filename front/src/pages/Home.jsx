import { signInWithPopup } from "firebase/auth";
import { lazy, Suspense, useState } from "react";
import { auth, googleProvider } from "../../utils/firebase";
import api from "../../utils/axios";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { setUserdata } from "../redux/userSlice";
import { getErrorMessage } from "../features/errorMessage";

import SideBar from "../components/SideBar";
import ChatArea from "../components/ChatArea";

/* The artifact panel pulls in the Monaco editor, which is by far the largest
   dependency in the bundle. Loading it on demand keeps the initial chat view
   light for the majority of conversations that never produce code. */
const Artifact = lazy(() => import("../components/Artifact"));

function Home() {
  const { userData, authChecked } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState(null);

  const googleLogin = async () => {
    if (signingIn) return;

    setSigningIn(true);
    setAuthError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const { data } = await api.post("/api/auth/login", { token });

      if (!data?.userId) {
        setAuthError("Sign in failed. Please try again.");
        return;
      }

      dispatch(setUserdata(data));
    } catch (error) {
      /* Closing the Google popup is a normal user action, not a failure. */
      if (
        error?.code === "auth/popup-closed-by-user" ||
        error?.code === "auth/cancelled-popup-request"
      ) {
        return;
      }

      console.error("Login failed:", error);
      setAuthError(getErrorMessage(error, "Sign in failed. Please try again."));
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="ankai-app-shell relative overflow-hidden bg-[var(--ankai-bg)] text-white">
      <div className="relative z-10 flex h-full min-h-0">
        <SideBar />
        <ChatArea />
        <Suspense fallback={null}>
          <Artifact />
        </Suspense>
      </div>

      {/* Wait for the session check to settle, otherwise an already signed-in
          user sees this modal flash on every page load. */}
      {authChecked && !userData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xl">
          <div className="w-[92vw] max-w-[380px] rounded-2xl border border-[var(--ankai-border)] bg-[var(--ankai-surface)] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="mb-7 flex flex-col items-center text-center">
              <img
                src="/AnkAi-logo.png"
                alt="AnkAI"
                width={549}
                height={176}
                decoding="async"
                className="mb-4 h-10 w-auto object-contain"
              />

              <h2 className="ankai-display text-xl font-semibold tracking-tight text-white">
                Welcome to AnkAI
              </h2>

              <p className="mt-2 text-[13px] leading-relaxed text-white/40">
                Sign in to continue your conversations, research, coding and
                autonomous workflows.
              </p>
            </div>

            {authError && (
              <div className="mb-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-center text-[12px] text-red-200">
                {authError}
              </div>
            )}

            <button
              onClick={googleLogin}
              disabled={signingIn}
              className="ankai-focus flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3 text-[13.5px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
            >
              <FcGoogle size={18} />
              {signingIn ? "Signing in…" : "Continue with Google"}
            </button>

            <p className="mt-5 text-center text-[11px] text-white/25">
              Secure authentication powered by Google.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
