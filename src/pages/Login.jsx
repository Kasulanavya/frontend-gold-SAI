
// import { motion } from "framer-motion";
// import { Link, useNavigate } from "react-router-dom";
// import { useState } from "react";

// export default function Login() {

//   const navigate = useNavigate();

//   const [email,setEmail] = useState("");
//   const [password,setPassword] = useState("");

//   const handleLogin = (e) => {

//     e.preventDefault();

//     // default credentials
//     if(email === "rahulsharma@gmail.com" && password === "123456"){

//       // save login state
//       localStorage.setItem("isLoggedIn","true");

//       // go to homepage
//       navigate("/");

//     }else{

//       alert("Invalid email or password");

//     }

//   };

//   return (

//     <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">

//       {/* gold glow */}
//       <div className="absolute w-[900px] h-[900px] bg-yellow-500 opacity-10 blur-[220px] rounded-full pointer-events-none"></div>

//       {/* login card */}
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
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e)=>setPassword(e.target.value)}
//             className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white focus:border-yellow-400 outline-none text-lg"
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
//             className="w-full bg-yellow-400 text-black font-semibold py-4 rounded-xl hover:bg-yellow-300 transition text-lg"
//           >
//             Login
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
//API integration 
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../api/augmontApi";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const data = await loginUser(email, password);

      console.log("Login Response:", data);

      if (!data) {
        throw new Error("Invalid login response");
      }

      // save login session
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(data));

      // redirect to dashboard
      navigate("/dashboard");

    } catch (error) {

      console.error("Login Error:", error);
      alert("Login failed. Please check your credentials.");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">

      {/* gold background glow */}
      <div className="absolute w-[900px] h-[900px] bg-yellow-500 opacity-10 blur-[220px] rounded-full pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-gradient-to-b from-[#141414] to-[#0b0b0b] border border-gray-800 rounded-3xl p-14 w-full max-w-lg shadow-xl"
      >

        <h2 className="text-4xl font-bold text-white mb-2">
          Welcome Back
        </h2>

        <p className="text-gray-400 mb-10 text-lg">
          Login to your gold investment account
        </p>

        <form className="space-y-6" onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white focus:border-yellow-400 outline-none text-lg"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white focus:border-yellow-400 outline-none text-lg"
            required
          />

          <div className="flex justify-between text-sm">

            <span className="text-gray-400">
              Remember me
            </span>

            <Link
              to="/forgot-password"
              className="text-yellow-400 hover:text-yellow-300"
            >
              Forgot password?
            </Link>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-semibold py-4 rounded-xl hover:bg-yellow-300 transition text-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-gray-400 text-md mt-8 text-center">

          Don't have an account?{" "}

          <Link
            to="/signup"
            className="text-yellow-400 hover:text-yellow-300 font-medium"
          >
            Sign Up
          </Link>

        </p>

      </motion.div>

    </div>
  );
}