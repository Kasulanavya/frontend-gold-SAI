import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUser } from "../api/augmontApi";
import { Lock, User, ShieldCheck } from "lucide-react"; // ✅ FIX 1 (added ShieldCheck)

export default function Signup() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        
        {/* Left visual panel */}
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

          {/* Coins */}
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
              <svg width="48" height="48">
                <ellipse cx="24" cy="24" rx="22" ry="18" fill="#FFD700" stroke="#FFC700" strokeWidth="2" />
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
                <rect x="6" y="8" width="48" height="16" rx="4" fill="#FFD700" stroke="#FFC700" strokeWidth="2" />
                <text x="30" y="22" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">Au</text>
              </svg>
            </div>
          ))}

          {/* Glow effect */}
          <div className="absolute left-1/2 top-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-yellow-400 opacity-10 blur-[120px] rounded-full" />

          {/* Info box */}
          <div className="relative flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-[0_12px_30px_rgba(251,191,36,0.25)]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Secure Gold Vault</h2>
              <p className="text-md text-yellow-200">Access your portfolio with bank-grade security.</p>
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
              Minimal interface, maximum trust. All data is encrypted and stored securely.
            </p>
          </div>

        </div> {/* ✅ FIX 2: properly closed LEFT panel */}

        {/* Right form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12">
          <div className="mx-auto w-full max-w-md rounded-3xl bg-black bg-opacity-80 p-10 shadow-xl">

            <h1 className="text-3xl font-bold text-white">Sign Up</h1>

            <form className="mt-10 space-y-6" onSubmit={handleSignup}>

              {error && (
                <div className="text-center text-sm text-red-400 font-semibold">{error}</div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black border border-yellow-700 text-white"
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black border border-yellow-700 text-white"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black border border-yellow-700 text-white"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black border border-yellow-700 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold"
              >
                {loading ? "Signing up..." : "Sign Up"}
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