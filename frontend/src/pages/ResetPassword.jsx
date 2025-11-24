import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import API from "../lib/api";

export default function ResetPassword() {
  const [codeDigits, setCodeDigits] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = location.state || {};
  const inputRefs = useRef([]);
  const cooldownTimer = useRef(null);

  useEffect(() => {
    if (!userId || !email) {
      navigate("/forgot-password");
      return;
    }
    inputRefs.current[0]?.focus();
  }, [email, userId, navigate]);

  const codeValue = codeDigits.join("");

  const handleCodeChange = (value, index) => {
    const sanitized = value.replace(/[^0-9]/g, "").slice(0, 1);
    const updated = [...codeDigits];
    updated[index] = sanitized;
    setCodeDigits(updated);

    if (sanitized && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      const updated = [...codeDigits];
      updated[index - 1] = "";
      setCodeDigits(updated);
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (codeValue.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setIsVerifying(true);
    try {
      await API.post("/auth/verify-reset-code", { userId, code: codeValue });
      setSuccess("Code verified!");
      setTimeout(
        () => navigate("/set-password", { state: { userId, email, code: codeValue } }),
        400
      );
    } catch (err) {
      const msg = err.response?.data?.msg || "Invalid code";
      setError(msg);

      // ⬇️ Inserted logic
      if (msg.toLowerCase().includes("expired")) {
        setCodeDigits(Array(6).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }

    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (cooldown <= 0 && cooldownTimer.current) {
      clearInterval(cooldownTimer.current);
      cooldownTimer.current = null;
      return;
    }
    if (cooldown > 0 && !cooldownTimer.current) {
      cooldownTimer.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimer.current);
            cooldownTimer.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
        cooldownTimer.current = null;
      }
    };
  }, [cooldown]);

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    setError("");
    setSuccess("");
    try {
      await API.post("/auth/forgot-password", { email });
      setSuccess("A new code has been sent to your email.");
      setCooldown(60);
    } catch {
      setError("Unable to resend code right now.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] w-full bg-gradient-to-b from-indigo-50 via-white to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-indigo-100/60 p-8">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <HiOutlineShieldCheck className="text-3xl" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Enter Reset Code</h1>
          <p className="mt-2 text-sm text-slate-500">
            We&apos;ve sent a 6-digit code to{" "}
            <span className="font-semibold text-slate-900">{email || "your email"}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 text-center">{error}</p>
          )}
          {success && (
            <p className="rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700 text-center">{success}</p>
          )}

          <div className="flex items-center justify-between gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={codeDigits[index]}
                onChange={(e) => handleCodeChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="h-14 w-12 rounded-xl border border-slate-200 text-center text-lg font-semibold text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full rounded-[12px] bg-indigo-600 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isVerifying ? "Verifying Code..." : "Verify Code"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            disabled={resending || cooldown > 0}
          >
            {resending
              ? "Sending reset code..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend Code"}
          </button>
          {cooldown > 0 && (
            <p className="mt-2 text-xs text-slate-400">
              You can request another code once the timer reaches zero.
            </p>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 text-sm text-slate-400">
        <Link to="/forgot-password" className="hover:text-slate-500">
          ← Back
        </Link>
      </div>
    </div>
  );
}
