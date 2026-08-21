import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { auth, googleProvider } from "../../utils/firebase";
import api from "../../utils/axios";
import { setUserdata } from "../redux/userSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const token = await result.user.getIdToken();

      const { data } = await api.post("/api/auth/login", {
        token,
      });

      dispatch(setUserdata(data));

      navigate("/app");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white">

      <div className="mx-auto flex min-h-screen max-w-[1380px] flex-col px-6 lg:px-10">

        <header className="flex h-[76px] items-center justify-between">

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <Sparkles size={16} />
            </div>

            <span className="font-['Sora'] text-[17px] font-semibold">
              AnkAI
            </span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[12px] text-white/45 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Back
          </button>

        </header>

        <main className="flex flex-1 items-center justify-center py-16">

          <div className="w-full max-w-[410px]">

            <div className="mb-10 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <Sparkles size={19} className="text-[#7567f8]" />
              </div>

              <h1 className="mt-7 font-['Sora'] text-3xl font-semibold tracking-[-0.04em]">
                Welcome to AnkAI
              </h1>

              <p className="mt-3 text-[13px] leading-6 text-white/40">
                Your workspace for thinking, creating and building.
              </p>

            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#111419] p-6">

              <button
                onClick={googleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3 text-[13px] font-medium text-[#111] transition hover:bg-white/90"
              >
                <FcGoogle size={17} />
                Continue with Google
              </button>

              <p className="mt-6 text-center text-[11px] leading-5 text-white/25">
                By continuing, you agree to use AnkAI responsibly.
              </p>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
};

export default Login;