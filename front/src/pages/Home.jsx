import { signInWithPopup } from "firebase/auth";
import React from "react";
import { auth, googleProvider } from "../../utils/firebase";
import api from "../../utils/axios";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { setUserdata } from "../redux/userSlice";

import SideBar from "../components/SideBar";
import ChatArea from "../components/ChatArea";
import Artifact from "../components/Artifact";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token });
      dispatch(setUserdata(data));
    } catch (error) {
      console.log(error);
    }
  };

  const googleLogin = async () => {
    const data = await signInWithPopup(auth, googleProvider);
    const token = await data.user.getIdToken();
    await handleLogin(token);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[var(--ankai-bg)] text-white">
      <div className="relative z-10 flex h-full">
        <SideBar />
        <ChatArea />
        <Artifact />
      </div>

      {!userData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xl">
          <div className="w-[92vw] max-w-[380px] rounded-2xl border border-[var(--ankai-border)] bg-[var(--ankai-surface)] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="mb-7 flex flex-col items-center text-center">
              <img src="/AnkAi.png" alt="AnkAI" className="mb-4 h-12 w-auto" />

              <h2 className="ankai-display text-xl font-semibold tracking-tight text-white">
                Welcome to AnkAI
              </h2>

              <p className="mt-2 text-[13px] leading-relaxed text-white/40">
                Sign in to continue your conversations, research, coding and
                autonomous workflows.
              </p>
            </div>

            <button
              onClick={googleLogin}
              className="ankai-focus flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3 text-[13.5px] font-semibold text-black transition hover:bg-white/90"
            >
              <FcGoogle size={18} />
              Continue with Google
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
