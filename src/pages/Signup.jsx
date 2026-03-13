// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";

// export default function Signup() {
//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">

//       {/* gold glow background */}
//       <div className="absolute w-[900px] h-[900px] bg-yellow-500 opacity-10 blur-[220px] rounded-full pointer-events-none"></div>

//       {/* signup card */}
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="relative z-10 bg-gradient-to-b from-[#141414] to-[#0b0b0b] border border-gray-800 rounded-3xl p-14 w-full max-w-lg shadow-xl"
//       >

//         <h2 className="text-4xl font-bold text-white mb-2">
//           Create Account
//         </h2>

//         <p className="text-gray-400 mb-10 text-lg">
//           Start investing in digital gold
//         </p>

//         <form className="space-y-6">

//           <input
//             type="text"
//             placeholder="Full Name"
//             className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white focus:border-yellow-400 outline-none text-lg"
//           />

//           <input
//             type="email"
//             placeholder="Email address"
//             className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white focus:border-yellow-400 outline-none text-lg"
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white focus:border-yellow-400 outline-none text-lg"
//           />

//           <button className="w-full bg-yellow-400 text-black font-semibold py-4 rounded-xl hover:bg-yellow-300 transition text-lg">
//             Create Account
//           </button>

//         </form>

//         <p className="text-gray-400 text-md mt-8 text-center">
//           Already have an account?{" "}
//           <Link
//             to="/login"
//             className="text-yellow-400 hover:text-yellow-300 font-medium"
//           >
//             Login
//           </Link>
//         </p>

//       </motion.div>

//     </div>
//   );
// }

import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUser } from "../api/augmontApi";

export default function Signup() {

  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const handleSignup = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const payload = {
        name,
        email,
        password
      };

      const data = await createUser(payload);

      console.log("Signup Response:", data);

      alert("Account created successfully");

      navigate("/login");

    } catch (error) {

      console.error("Signup error:", error);

      alert("Signup failed");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">

      <div className="absolute w-[900px] h-[900px] bg-yellow-500 opacity-10 blur-[220px] rounded-full"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-gradient-to-b from-[#141414] to-[#0b0b0b] border border-gray-800 rounded-3xl p-14 w-full max-w-lg shadow-xl"
      >

        <h2 className="text-4xl font-bold text-white mb-2">
          Create Account
        </h2>

        <p className="text-gray-400 mb-10 text-lg">
          Start investing in digital gold
        </p>

        <form className="space-y-6" onSubmit={handleSignup}>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white focus:border-yellow-400 outline-none text-lg"
            required
          />

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-semibold py-4 rounded-xl hover:bg-yellow-300 transition text-lg"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

        </form>

        <p className="text-gray-400 text-md mt-8 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-yellow-400 hover:text-yellow-300 font-medium"
          >
            Login
          </Link>
        </p>

      </motion.div>

    </div>

  );

}