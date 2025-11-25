import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc"

import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUserCircle,
  HiOutlineEye, HiOutlineEyeSlash
} from "react-icons/hi2";
import API from "../lib/api";

const slideConfig = {
  login: {
    title: "Welcome back",
    cta: "Login",
    helper: "Login or create your account",
  },
  signup: {
    title: "Create account",
    cta: "Create account",
    helper: "Join the community in a few seconds",
  },
};

export default function Login({ initialMode = "login" }) {
  const [signupLoading, setSignupLoading] = useState(false);

  const [mode, setMode] = useState(initialMode);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(null);
  const [panelHeight, setPanelHeight] = useState(null);
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const loginPanelRef = useRef(null);
  const signupPanelRef = useRef(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const persistSession = (token, user) => {
    localStorage.setItem("token", token);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("user-updated"));
      }
    }
  };

  useEffect(() => {
    setMode(initialMode);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [initialMode]);

  const handleTabChange = (target) => {
    if (target === mode) return;
    setMode(target);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      navigate(target === "login" ? "/login" : "/signup");
    }, 450);
  };

  const handleGoogleAuth = async (tokenResponse, target) => {
    setGoogleLoading(target);
    const tokenPayload =
      tokenResponse?.credential ||
      tokenResponse?.id_token ||
      tokenResponse?.access_token;

    if (!tokenPayload) {
      const message = "Unable to retrieve Google credential";
      target === "login" ? setLoginError(message) : setSignupError(message);
      setGoogleLoading(null);
      return;
    }

    try {
      const res = await API.post("/auth/google", {
        credential: tokenResponse?.credential || tokenResponse?.id_token,
        accessToken: tokenResponse?.access_token,
      });
      persistSession(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.msg || "Google sign-in failed";
      target === "login" ? setLoginError(message) : setSignupError(message);
    } finally {
      setGoogleLoading(null);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: (tokenResponse) => handleGoogleAuth(tokenResponse, "login"),
    onError: () => setLoginError("Google sign-in failed"),
  });

  const signupWithGoogle = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: (tokenResponse) => handleGoogleAuth(tokenResponse, "signup"),
    onError: () => setSignupError("Google sign-up failed"),
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await API.post("/auth/login", loginForm);
      persistSession(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setLoginError(err.response?.data?.msg || "Something went wrong");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError("");
  
    if (signupForm.password.length < 8) {
      setSignupError("Password must be at least 8 characters long.");
      return;
    }
    setSignupLoading(true);
  
    try {
      const formData = new FormData();
      formData.append("name", signupForm.name);
      formData.append("email", signupForm.email);
      formData.append("password", signupForm.password);

      const res = await API.post("/auth/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      navigate("/verify-email", {
        state: { userId: res.data.userId, email: signupForm.email },
      });
    } catch (err) {
      setSignupError(err.response?.data?.msg || "Something went wrong");
    } finally {
      setSignupLoading(false);
    }
  };
  


  const sharedInput =
    "w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400";

  const updatePanelHeight = useCallback(() => {
    const targetRef = mode === "signup" ? signupPanelRef : loginPanelRef;
    if (targetRef.current) {
      setPanelHeight(targetRef.current.scrollHeight);
    }
  }, [mode]);

  useLayoutEffect(() => {
    updatePanelHeight();
  }, [mode, loginForm, signupForm, loginError, signupError, updatePanelHeight]);

  useEffect(() => {
    window.addEventListener("resize", updatePanelHeight);
    return () => window.removeEventListener("resize", updatePanelHeight);
  }, [updatePanelHeight]);

  return (
    <div>
      <div className="w-full bg-gradient-to-b from-indigo-50/80 via-white to-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[500px] rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-indigo-100/60 p-4">
          <div className="text-center">
            <h1 className=" text-3xl font-semibold text-slate-900">{slideConfig[mode].title}</h1>
            <p className="mt-2 text-sm text-slate-500">{slideConfig[mode].helper}</p>
          </div>

          <div className="mt-4 px-10">
            <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className={`w-1/2 rounded-full py-2 text-sm font-semibold transition-all ${mode === "login"
                  ? "bg-white text-indigo-600 shadow"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("signup")}
                className={`w-1/2 rounded-full py-2 text-sm font-semibold transition-all ${mode === "signup"
                  ? "bg-white text-indigo-600 shadow"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <div
            className="relative mt-8 overflow-hidden pb-2 transition-[height] duration-500 ease-out"
            style={{ height: panelHeight ? `${panelHeight}px` : undefined }}
          >
            <div
              ref={loginPanelRef}
              className={`absolute inset-0 px-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${mode === "login"
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0 pointer-events-none"
                }`}
            >
              <div className="bg-white">
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="flex w-full items-center justify-center gap-3 rounded-[10px] border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  disabled={googleLoading === "login"}
                >
                  <FcGoogle className="text-xl" />
                  {googleLoading === "login" ? "Connecting..." : "Continue with Google"}
                </button>

                <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  Or with email
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <form onSubmit={handleLoginSubmit} className="mt-6 space-y-5">
                  {loginError && (
                    <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{loginError}</p>
                  )}

                  <label className="block text-left text-sm font-medium text-slate-700">
                    Email
                    <div className="mt-2 flex items-center rounded-[10px] border border-slate-200 px-4 py-3 shadow-sm focus-within:border-indigo-500">
                      <HiOutlineEnvelope className="mr-3 text-xl text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="your.email@example.com"
                        value={loginForm.email}
                        onChange={(e) =>
                          setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                        }
                        className={sharedInput}
                        required
                      />
                    </div>
                  </label>

                  <div className="mt-2 flex items-center rounded-[10px] border border-slate-200 px-4 py-3 shadow-sm focus-within:border-indigo-500">
                    <HiOutlineLockClosed className="mr-3 text-xl text-slate-400" />

                    <input
                      type={showLoginPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                      }
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((p) => !p)}
                      className="ml-3 text-xl text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                    </button>
                  </div>


                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <input type="checkbox" id="remember" className="rounded border-slate-200 text-indigo-600" />
                      <label htmlFor="remember">Remember me</label>
                    </div>
                    <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-[10px] bg-indigo-600 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500"
                  >
                    Login
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                  <Link to="/" className="hover:text-slate-500">
                    ← Back to Home
                  </Link>
                </p>
              </div>
            </div>
            <div
              ref={signupPanelRef}
              className={`absolute inset-0 px-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${mode === "signup"
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 pointer-events-none"
                }`}
            >
              <div className="bg-white">
                <button
                  type="button"
                  onClick={() => signupWithGoogle()}
                  className="flex w-full items-center justify-center gap-3 rounded-[10px] border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  disabled={googleLoading === "signup"}
                >
                  <FcGoogle className="text-xl" />
                  {googleLoading === "signup" ? "Connecting..." : "Continue with Google"}
                </button>

                <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  Or with email
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <form onSubmit={handleSignupSubmit} className="mt-6 space-y-5">
                  {signupError && (
                    <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{signupError}</p>
                  )}

                  <label className="block text-left text-sm font-medium text-slate-700">
                    Full Name
                    <div className="mt-2 flex items-center rounded-[10px] border border-slate-200 px-4 py-3 shadow-sm focus-within:border-indigo-500">
                      <HiOutlineUserCircle className="mr-3 text-xl text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Jane Doe"
                        value={signupForm.name}
                        onChange={(e) =>
                          setSignupForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                        }
                        className={sharedInput}
                        required
                      />
                    </div>
                  </label>

                  <label className="block text-left text-sm font-medium text-slate-700">
                    Email
                    <div className="mt-2 flex items-center rounded-[10px] border border-slate-200 px-4 py-3 shadow-sm focus-within:border-indigo-500">
                      <HiOutlineEnvelope className="mr-3 text-xl text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="your.email@example.com"
                        value={signupForm.email}
                        onChange={(e) =>
                          setSignupForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                        }
                        className={sharedInput}
                        required
                      />
                    </div>
                  </label>

                  <div className="mt-2 flex items-center rounded-[10px] border border-slate-200 px-4 py-3 shadow-sm focus-within:border-indigo-500">
                    <HiOutlineLockClosed className="mr-3 text-xl text-slate-400" />

                    <input
                      type={showSignupPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a secure password"
                      value={signupForm.password}
                      onChange={(e) =>
                        setSignupForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                      }
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((p) => !p)}
                      className="ml-3 text-xl text-slate-400 hover:text-slate-600"
                    >
                      {showSignupPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    By creating an account, you agree to our{" "}
                    <span className="font-semibold text-indigo-600">Terms</span> and{" "}
                    <span className="font-semibold text-indigo-600">Privacy Policy</span>.
                  </p>

                  <button
  type="submit"
  disabled={signupLoading}
  className="w-full rounded-[10px] bg-indigo-600 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30
             hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>
  {signupLoading && (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  )}

  {signupLoading ? "Sending Verification Email..." : "Create Account"}
</button>


                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                  Already using Follow Mate?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("login")}
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
