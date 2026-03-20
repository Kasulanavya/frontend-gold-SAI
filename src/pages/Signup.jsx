import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, User, Smartphone, KeyRound, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { sendOtp, setUserProfile, verifyOtp } from "../api/authApi";
import { createUser } from "../api/augmontApi";

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const goldCoins = Array.from({ length: 8 });

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !mobileNumber) {
      toast.error("Fill name, email, and mobile number");
      return;
    }

    setLoading(true);
    const response = await sendOtp({ email, mobileNumber, type: "register" });
    setLoading(false);

    if (!response?.ok) {
      toast.error(response?.message || "Failed to send OTP");
      return;
    }

    setOtpSent(true);
    toast.success(response?.message || "OTP sent successfully");
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Enter the OTP");
      return;
    }

    setLoading(true);
    const response = await verifyOtp({
      fullName,
      email,
      mobileNumber,
      otp,
      type: "register"
    });

    if (!response?.ok || !response?.token) {
      setLoading(false);
      toast.error(response?.message || "OTP verification failed");
      return;
    }

    setUserProfile({
      fullName,
      email,
      mobileNumber
    });

    const createUserResponse = await createUser({
      name: fullName,
      email,
      mobileNumber
    });

    const createdUniqueId =
      createUserResponse?.payload?.result?.data?.uniqueId ||
      createUserResponse?.payload?.result?.uniqueId ||
      createUserResponse?.uniqueId ||
      "";

    if (createdUniqueId) {
      setUserProfile({
        fullName,
        email,
        mobileNumber,
        uniqueId: createdUniqueId
      });
    }

    setLoading(false);

    if (createUserResponse?.status && createUserResponse.status !== "success") {
      toast.error(createUserResponse?.payload?.message || "User created in auth backend, but Augmont sync failed");
      navigate("/dashboard");
      return;
    }

    toast.success("Account created successfully");
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen font-sans text-white"
      style={{
        background: "radial-gradient(circle at 60% 40%, #2a2100 0%, #000 100%)"
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-transparent md:flex-row">
        <div className="relative flex flex-1 flex-col items-center justify-center px-8 py-16 md:px-12">
          <style>{`
            @keyframes fallCoin3D {
              0% { top: -40px; opacity: 0.7; transform: scale(1) rotate(0deg); }
              40% { opacity: 1; transform: scale(1.1) rotate(20deg); }
              70% { opacity: 1; transform: scale(1) rotate(-10deg); }
              100% { top: 90%; opacity: 0.2; transform: scale(0.9) rotate(0deg); }
            }
            .animate-fallCoin3D {
              animation: fallCoin3D 2.8s linear infinite;
            }
            @keyframes riseBar {
              0% { bottom: 0%; opacity: 0.5; }
              40% { opacity: 1; }
              100% { bottom: 10%; opacity: 1; }
            }
            .animate-riseBar {
              animation: riseBar 2.5s ease-in-out infinite alternate;
            }
          `}</style>

          {goldCoins.map((_, i) => (
            <div
              key={i}
              className="absolute animate-fallCoin3D"
              style={{
                left: `${8 + i * 12}%`,
                top: `-${30 + i * 10}px`,
                animationDelay: `${i * 0.6}s`,
                width: "48px",
                height: "48px",
                zIndex: 2
              }}
            >
              <svg width="48" height="48">
                <ellipse cx="24" cy="24" rx="22" ry="18" fill="#FFD700" stroke="#FFC700" strokeWidth="2" />
                <text x="24" y="29" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">
                  G
                </text>
              </svg>
            </div>
          ))}

          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute animate-riseBar"
              style={{
                left: `${18 + i * 18}%`,
                bottom: "10%",
                animationDelay: `${i * 0.8}s`,
                width: "60px",
                height: "32px",
                zIndex: 1
              }}
            >
              <svg width="60" height="32" viewBox="0 0 60 32">
                <rect x="6" y="8" width="48" height="16" rx="4" fill="#FFD700" stroke="#FFC700" strokeWidth="2" />
                <text x="30" y="22" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">
                  Au
                </text>
              </svg>
            </div>
          ))}

          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400 opacity-10 blur-[120px]" />

          <div className="relative flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-[0_12px_30px_rgba(251,191,36,0.25)]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Create Your Gold Account</h2>
              <p className="text-md text-yellow-200">Register with OTP and sync the new account to the gold backend.</p>
            </div>

            <div className="relative flex w-full items-center justify-center">
              <div className="relative flex h-36 w-56 flex-col gap-2 rounded-3xl bg-gradient-to-br from-amber-200/40 via-yellow-200/25 to-amber-100/20 p-4 shadow-inner">
                <div className="h-3 w-16 rounded-full bg-yellow-300/70" />
                <div className="flex gap-2">
                  <div className="h-12 w-16 rounded-2xl bg-yellow-300/70 shadow-md" />
                  <div className="h-12 w-16 rounded-2xl bg-yellow-300/70 shadow-md" />
                  <div className="h-12 w-16 rounded-2xl bg-yellow-300/70 shadow-md" />
                </div>
                <div className="mt-2 h-3 w-10 rounded-full bg-yellow-300/70" />
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Registration now follows your backend flow: send OTP, verify OTP, then create the downstream user record.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12">
          <div className="mx-auto w-full max-w-md rounded-3xl bg-black bg-opacity-80 p-10 shadow-xl">
            <h1 className="text-3xl font-bold text-white">Sign Up</h1>
            <p className="mt-2 text-md text-yellow-200">
              {otpSent ? "Enter the OTP to complete registration." : "Fill your details and request a registration OTP."}
            </p>

            <form className="mt-10 space-y-6" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-yellow-200" htmlFor="fullName">
                  Full name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-200" />
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={otpSent}
                    className="w-full rounded-xl border border-yellow-700 bg-black py-3 pl-10 pr-4 text-sm text-white disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-yellow-200" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-200" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                    className="w-full rounded-xl border border-yellow-700 bg-black py-3 pl-10 pr-4 text-sm text-white disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-yellow-200" htmlFor="mobileNumber">
                  Mobile number
                </label>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-200" />
                  <input
                    id="mobileNumber"
                    type="tel"
                    placeholder="Enter mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    disabled={otpSent}
                    className="w-full rounded-xl border border-yellow-700 bg-black py-3 pl-10 pr-4 text-sm text-white disabled:opacity-60"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-yellow-200" htmlFor="otp">
                    OTP
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-200" />
                    <input
                      id="otp"
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full rounded-xl border border-yellow-700 bg-black py-3 pl-10 pr-4 text-sm text-white"
                    />
                  </div>
                </div>
              )}

              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="text-sm font-semibold text-yellow-400 hover:text-yellow-300"
                >
                  Change registration details
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-yellow-400 py-3 text-lg font-bold text-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Please wait..." : otpSent ? "Verify OTP & Create Account" : "Send OTP"}
              </button>

              <p className="text-center text-yellow-300">
                Already have an account?{" "}
                <Link to="/login">Login</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
