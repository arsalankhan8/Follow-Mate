import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEnvelope, HiOutlineKey } from "react-icons/hi2";
import API from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email });
      setSuccess("Reset code sent! Check your inbox.");
      navigate("/reset-password", { state: { userId: res.data.userId, email } });
    } catch (err) {
      setError(err.response?.data?.msg || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] w-full bg-gradient-to-b from-indigo-50 via-white to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-indigo-100/60 p-8">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <HiOutlineKey className="text-3xl" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Forgot Password?</h1>
          <p className="mt-2 text-sm text-slate-500">
            No worries! Enter your email and we&apos;ll send you a reset code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}
          {success && (
            <p className="rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700">{success}</p>
          )}

          <label className="block text-left text-sm font-medium text-slate-700">
            Email Address
            <div className="mt-2 flex items-center rounded-[12px] border border-slate-200 px-4 py-3 shadow-sm focus-within:border-indigo-500">
              <HiOutlineEnvelope className="mr-3 text-xl text-slate-400" />
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                required
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[12px] bg-indigo-600 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? "Sending Reset Code..." : "Send Reset Code"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Back to Login
          </Link>
        </p>
      </div>

      <div className="absolute bottom-6 text-sm text-slate-400">
        <Link to="/" className="hover:text-slate-500">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
