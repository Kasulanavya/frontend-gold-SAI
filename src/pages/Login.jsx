
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Lock, User, ShieldCheck } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Gold coin animation
  const goldCoins = Array.from({ length: 8 });

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "rahulsharma@gmail.com" && password === "123456") {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/");
    } else {
      alert("Invalid email or password");
    }
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
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-50/80 via-transparent to-transparent" />
            </div>

            <p className="text-xs text-slate-500">
              Minimal interface, maximum trust. All data is encrypted and stored securely.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12">
          <div className="mx-auto w-full max-w-md rounded-3xl bg-black bg-opacity-80 p-10 shadow-xl">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">Login</h1>
              <p className="text-md text-yellow-200">
                Continue to your SabPe Gold account.
              </p>
            </div>

            <form className="mt-10 space-y-6" onSubmit={handleLogin}>
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
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-200" />
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-yellow-700 bg-black bg-opacity-60 py-3 pl-10 pr-4 text-sm text-white shadow-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-300" />
                  Remember me
                </label>
                <a href="/forgot-password" className="font-semibold text-amber-600 hover:text-amber-700 transition">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-yellow-400 px-6 py-3 text-lg font-bold text-black shadow-sm transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-yellow-200"
              >
                Sign in
              </button>

              <div className="text-center text-xs text-yellow-200 mt-4">
                Don’t have an account?{' '}
                <a href="/signup" className="font-semibold text-yellow-400 hover:text-yellow-300">
                  Create one
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Gold coin and bar animation CSS */}
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
    </div>
  );
}

// import { motion } from "framer-motion";
// import { Link, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { loginUser } from "../api/augmontApi";

// export default function Login() {

//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {

//     e.preventDefault();

//     try {

//       setLoading(true);

//       const data = await loginUser(email, password);

//       console.log("Login Response:", data);

//       if (!data) {
//         throw new Error("Invalid login response");
//       }

//       // save login session
//       localStorage.setItem("isLoggedIn", "true");
//       localStorage.setItem("user", JSON.stringify(data));

//       // redirect to dashboard
//       navigate("/dashboard");

//     } catch (error) {

//       console.error("Login Error:", error);
//       alert("Login failed. Please check your credentials.");

//     } finally {

//       setLoading(false);

//     }

//   };

//   return (

//     <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">

//       {/* gold background glow */}
//       <div className="absolute w-[900px] h-[900px] bg-yellow-500 opacity-10 blur-[220px] rounded-full pointer-events-none"></div>

//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="relative z-10 bg-gradient-to-b from-[#141414] to-[#0b0b0b] border border-gray-800 rounded-3xl p-14 w-full max-w-lg shadow-xl"
//       >

//         <h2 className="text-4xl font-bold text-white mb-2">
//           Welcome Back
//         </h2>

//         <p className="text-gray-400 mb-10 text-lg">
//           Login to your gold investment account
//         </p>

//         <form className="space-y-6" onSubmit={handleLogin}>

//           <input
//             type="email"
//             placeholder="Email address"
//             value={email}
//             onChange={(e)=>setEmail(e.target.value)}
//             className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white focus:border-yellow-400 outline-none text-lg"
//             required
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e)=>setPassword(e.target.value)}
//             className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white focus:border-yellow-400 outline-none text-lg"
//             required
//           />

//           <div className="flex justify-between text-sm">

//             <span className="text-gray-400">
//               Remember me
//             </span>

//             <Link
//               to="/forgot-password"
//               className="text-yellow-400 hover:text-yellow-300"
//             >
//               Forgot password?
//             </Link>

//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-yellow-400 text-black font-semibold py-4 rounded-xl hover:bg-yellow-300 transition text-lg"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>

//         </form>

//         <p className="text-gray-400 text-md mt-8 text-center">

//           Don't have an account?{" "}

//           <Link
//             to="/signup"
//             className="text-yellow-400 hover:text-yellow-300 font-medium"
//           >
//             Sign Up
//           </Link>

//         </p>

//       </motion.div>

//     </div>
//   );
// }