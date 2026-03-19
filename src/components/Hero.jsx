import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Shield, Coins, Star } from "lucide-react";

export default function Hero() {
  const navigate = useNavigate();

  const handleInvestClick = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="relative min-h-[85vh] bg-black text-white flex items-center overflow-hidden px-4 lg:px-20 pt-20 lg:pt-28">

      {/* 🔥 BACKGROUND GLOW (FIXED FOR MOBILE) */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] lg:w-[650px] lg:h-[650px] bg-yellow-500 opacity-20 blur-[180px] rounded-full"></div>
      <div className="absolute top-0 left-0 w-[250px] h-[250px] lg:w-[350px] lg:h-[350px] bg-yellow-500 opacity-10 blur-[140px] rounded-full"></div>

      <div className="grid lg:grid-cols-2 gap-10 items-center w-full relative z-10">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-yellow-500/40 text-yellow-400 px-4 py-2 rounded-full mb-4 bg-yellow-500/5 text-sm">
            <TrendingUp size={14} />
            India's Trusted Digital Gold Platform
          </div>

          {/* Heading (REDUCED SIZE FOR MOBILE) */}
          <h1 className="text-3xl lg:text-6xl font-bold leading-tight">
            <span>Invest in </span>
            <span>Pure</span>
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Digital Gold
            </span>{" "}
            <span>with SabPe</span>
          </h1>

          {/* Description */}
          <p className="text-gray-400 mt-4 max-w-lg text-sm lg:text-lg">
            Buy, sell, and securely store 24K 99.99% pure gold anytime.
            Start your wealth journey today.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 mt-6 flex-wrap">

            {/* Start Investing */}
            <button
              onClick={handleInvestClick}
              className="relative flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-full font-semibold overflow-hidden group text-sm"
            >
              <span className="absolute inset-0 bg-yellow-400 blur-xl opacity-40 group-hover:opacity-70 transition"></span>

              <span className="relative flex items-center gap-2">
                Start Investing
                <ArrowRight size={16} />
              </span>
            </button>

            {/* Learn More */}
            <button
              onClick={() => navigate("/learn-more")}
              className="border border-white/20 px-6 py-3 rounded-full text-sm hover:border-yellow-400 hover:text-yellow-400 transition"
            >
              Learn More
            </button>

          </div>

          {/* Stats (COMPACT) */}
          <div className="flex gap-8 mt-8 flex-wrap">

            <div>
              <p className="text-yellow-400 text-xl lg:text-3xl font-bold">
                5L+
              </p>
              <p className="text-gray-400 text-xs lg:text-sm">
                Investors
              </p>
            </div>

            <div>
              <p className="text-yellow-400 text-xl lg:text-3xl font-bold">
                ₹500Cr+
              </p>
              <p className="text-gray-400 text-xs lg:text-sm">
                Traded
              </p>
            </div>

            <div>
              <p className="flex items-center gap-1 text-yellow-400 text-xl lg:text-3xl font-bold">
                4.9 <Star size={16} fill="currentColor" />
              </p>
              <p className="text-gray-400 text-xs lg:text-sm">
                Rating
              </p>
            </div>

          </div>

        </motion.div>

        {/* RIGHT CARD */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex justify-center"
        >
          <div className="relative">

            <div className="absolute -inset-8 bg-yellow-500 opacity-20 blur-[120px] rounded-full"></div>

            <div className="relative bg-[#0f0f0f] border border-yellow-500/20 p-5 rounded-3xl w-[280px] lg:w-[340px] backdrop-blur-xl">

              {/* Floating Tag */}
              <motion.div
                className="absolute -top-5 right-0 bg-yellow-400 text-black px-3 py-1 rounded-lg text-xs font-semibold"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                24K Pure
              </motion.div>

              {/* Portfolio */}
              <div className="bg-[#1a1a1a] p-4 rounded-xl mb-3">
                <p className="text-gray-400 text-xs">
                  Portfolio <span className="text-yellow-400 ml-1">+12%</span>
                </p>
                <p className="text-2xl font-bold">₹2,45,830</p>
                <p className="text-gray-500 text-xs">37.5g</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-xl mb-2">
                <Coins className="text-yellow-400" size={18} />
                <div>
                  <p className="text-sm font-semibold">Buy Gold</p>
                  <p className="text-gray-400 text-xs">From ₹10</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-xl mb-2">
                <TrendingUp className="text-yellow-400" size={18} />
                <div>
                  <p className="text-sm font-semibold">Live Price</p>
                  <p className="text-gray-400 text-xs">₹6,554/g</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-xl">
                <Shield className="text-yellow-400" size={18} />
                <div>
                  <p className="text-sm font-semibold">Secure Vault</p>
                  <p className="text-gray-400 text-xs">100% Safe</p>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}