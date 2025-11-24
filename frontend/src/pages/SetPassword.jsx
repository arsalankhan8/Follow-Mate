import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import API from "../lib/api";

export default function SetPassword() {
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, code } = location.state || {};
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!userId || !code) {
      navigate("/forgot-password");
    }
  }, [code, userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await API.post("/auth/reset-password", { userId, code, password: form.password });
      setSuccess("Password updated! Redirecting to login...");
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to reset password");
    }
  };

  return (
    <div className="relative min-h-[90vh] w-full bg-gradient-to-b from-indigo-50 via-white to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-indigo-100/60 p-8">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <HiOutlineLockClosed className="text-3xl" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Set New Password</h1>
          <p className="mt-2 text-sm text-slate-500">Create a strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
          {success && (
            <p className="rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700">{success}</p>
          )}

          <div className="mt-2 flex items-center rounded-[12px] border border-slate-200 px-4 py-3 shadow-sm focus-within:border-indigo-500">
            <HiOutlineLockClosed className="mr-3 text-xl text-slate-400" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="ml-3 text-xl text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
            </button>
          </div>


          <div className="mt-2 flex items-center rounded-[12px] border border-slate-200 px-4 py-3 shadow-sm focus-within:border-indigo-500">
            <HiOutlineLockClosed className="mr-3 text-xl text-slate-400" />

            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={form.confirm}
              onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.value }))}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="ml-3 text-xl text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
            </button>
          </div>


          <button
            type="submit"
            className="w-full rounded-[12px] bg-indigo-600 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500"
          >
            Reset Password
          </button>
        </form>
      </div>

      <div className="absolute bottom-6 text-sm text-slate-400">
        <Link to="/login" className="hover:text-slate-500">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

