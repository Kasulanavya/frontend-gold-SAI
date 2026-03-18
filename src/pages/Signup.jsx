

import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUser } from "../api/augmontApi";
import { Lock, User } from "lucide-react";

export default function Signup() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Gold coin animation
  const goldCoins = Array.from({ length: 8 });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await createUser({ name, email, password });
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError("Signup failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen font-sans text-white" style={{ background: "radial-gradient(circle at 60% 40%, #2a2100 0%, #000 100%)" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-transparent md:flex-row">
        {/* Left visual panel with gold coin and bar animation */}
        <div className="relative flex flex-1 flex-col items-center justify-center px-8 py-16 md:px-12">
          {/* 3D Gold coins and bars animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Gold coins */}
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
                  zIndex: 2,
                }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <ellipse cx="24" cy="24" rx="22" ry="18" fill="#FFD700" stroke="#FFC700" strokeWidth="2" filter="url(#coinShadow)" />
                  <defs>
                    <filter id="coinShadow" x="0" y="0" width="48" height="48">
                      <feDropShadow dx="0" dy="4" stdDeviation="2" floodColor="#bfa600"/>
                    </filter>
                  </defs>
                  <text x="24" y="29" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">G</text>
                </svg>
              </div>
            ))}
            {/* Gold bars */}
            {[0,1,2].map((i) => (
              <div
                key={i}
                className="absolute animate-riseBar"
                style={{
                  left: `${18 + i * 18}%`,
                  bottom: "10%",
                  animationDelay: `${i * 0.8}s`,
                  width: "60px",
                  height: "32px",
                  zIndex: 1,
                }}
              >
                <svg width="60" height="32" viewBox="0 0 60 32">
                  <rect x="6" y="8" width="48" height="16" rx="4" fill="#FFD700" stroke="#FFC700" strokeWidth="2" filter="url(#barShadow)" />
                  <defs>
                    <filter id="barShadow" x="0" y="0" width="60" height="32">
                      <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#bfa600"/>
                    </filter>
                  </defs>
                  <text x="30" y="22" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">Au</text>
                </svg>
              </div>
            ))}
            {/* Glow effect */}
            <div className="absolute left-1/2 top-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-yellow-400 opacity-10 blur-[120px] rounded-full" />
          </div>

          <div className="relative flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-[0_12px_30px_rgba(251,191,36,0.25)]">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FFD700" /><text x="12" y="17" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">S</text></svg>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Create Your Gold Account</h2>
              <p className="text-md text-yellow-200">Start your journey with SabPe Gold.</p>
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
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-50/80 via-transparent to-transparent" />
            </div>

            <p className="text-xs text-slate-500">
              Your data is encrypted and stored securely.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12">
          <div className="mx-auto w-full max-w-md rounded-3xl bg-black bg-opacity-80 p-10 shadow-xl">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">Sign Up</h1>
              <p className="text-md text-yellow-200">
                Create your SabPe Gold account.
              </p>
            </div>

            <form className="mt-10 space-y-6" onSubmit={handleSignup}>
              {error && (
                <div className="text-center text-sm text-red-400 font-semibold mb-2">{error}</div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-yellow-200" htmlFor="name">
                  Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-200" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-yellow-700 bg-black bg-opacity-60 py-3 pl-10 pr-4 text-sm text-white shadow-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-yellow-200" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-200" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-yellow-700 bg-black bg-opacity-60 py-3 pl-10 pr-4 text-sm text-white shadow-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-yellow-200" htmlFor="password">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-200" />
                  <input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-yellow-700 bg-black bg-opacity-60 py-3 pl-10 pr-4 text-sm text-white shadow-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-yellow-200" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-200" />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-yellow-700 bg-black bg-opacity-60 py-3 pl-10 pr-4 text-sm text-white shadow-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-yellow-400 px-6 py-3 text-lg font-bold text-black shadow-sm transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-yellow-200 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>

              <div className="text-center text-xs text-yellow-200 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-yellow-400 hover:text-yellow-300">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

