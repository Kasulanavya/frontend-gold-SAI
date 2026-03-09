import { motion } from "framer-motion";
import { ArrowRight, Play, TrendingUp, Shield, Coins, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-black text-white flex items-center overflow-hidden px-6 lg:px-20">

      {/* BIG GOLD BACKGROUND GLOWS */}

      <div className="absolute top-32 right-10 w-[650px] h-[650px] bg-yellow-500 opacity-20 blur-[220px] rounded-full"></div>

      <div className="absolute top-10 left-20 w-[350px] h-[350px] bg-yellow-500 opacity-10 blur-[180px] rounded-full"></div>


      <div className="grid lg:grid-cols-2 gap-12 items-center w-full relative z-10">

        {/* LEFT SIDE */}

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >

          {/* Badge */}

          <div className="inline-flex items-center gap-2 border border-yellow-500/40 text-yellow-400 px-5 py-2 rounded-full mb-6 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.25)]">
            <TrendingUp size={16} />
            India's Trusted Digital Gold Platform
          </div>

          {/* Heading */}

          <h1 className="text-5xl lg:text-6xl font-bold leading-tight">

            Invest in{" "}
            <span className="text-white">Pure</span>

            <br />

            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Digital Gold
            </span>{" "}
            with SabPe

          </h1>

          {/* Description */}

          <p className="text-gray-400 mt-6 max-w-xl text-lg">
            Buy, sell, and securely store 24K 99.99% pure gold anytime
            with SabPe Gold. Start your wealth journey today.
          </p>

          {/* Buttons */}

          <div className="flex gap-6 mt-8">

            {/* Start Investing */}

            <button className="relative flex items-center gap-2 bg-yellow-500 text-black px-7 py-3 rounded-full font-semibold overflow-hidden group">

              <span className="absolute inset-0 bg-yellow-400 blur-xl opacity-40 group-hover:opacity-70 transition"></span>

              <span className="relative flex items-center gap-2">
                Start Investing
                <ArrowRight size={18} />
              </span>

            </button>


            {/* Learn More */}

            <button className="flex items-center gap-2 border border-gray-700 px-7 py-3 rounded-full hover:bg-white/5 transition">
              <Play size={18} />
              Learn More
            </button>

          </div>

          {/* Stats */}

          <div className="flex gap-16 mt-14">

            <div>
              <p className="text-yellow-400 text-3xl font-bold drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]">
                5L+
              </p>
              <p className="text-gray-400">Active Investors</p>
            </div>

            <div>
              <p className="text-yellow-400 text-3xl font-bold drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]">
                ₹500Cr+
              </p>
              <p className="text-gray-400">Gold Traded</p>
            </div>

            <div>
              <p className="flex items-center gap-1 text-yellow-400 text-3xl font-bold drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]">
                4.9 <Star size={22} fill="currentColor" />
              </p>
              <p className="text-gray-400">App Rating</p>
            </div>

          </div>

        </motion.div>



        {/* RIGHT SIDE CARD */}

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >

          <div className="relative">

            {/* GOLD HALO BEHIND CARD */}

            <div className="absolute -inset-12 bg-yellow-500 opacity-20 blur-[160px] rounded-full"></div>

            {/* CARD */}

            <div className="relative bg-[#0f0f0f] border border-yellow-500/20 p-6 rounded-3xl w-[340px] backdrop-blur-xl shadow-[0_0_80px_rgba(234,179,8,0.25)]">

              {/* Gold Tag */}

              <motion.div
                className="absolute -top-6 right-0 bg-yellow-400 text-black px-4 py-2 rounded-xl font-semibold shadow-[0_0_25px_rgba(234,179,8,0.7)]"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                24K Pure
                <div className="text-sm font-medium">99.99% Gold</div>
              </motion.div>


              {/* Portfolio */}

              <div className="bg-[#1a1a1a] p-5 rounded-xl mb-4">

                <p className="text-gray-400 text-sm">
                  Your Gold Portfolio
                  <span className="text-yellow-400 ml-2">+12.4%</span>
                </p>

                <p className="text-3xl font-bold mt-1">₹2,45,830</p>

                <p className="text-gray-500 text-sm">37.5 grams</p>

              </div>


              {/* Buy Gold */}

              <div className="flex items-center gap-3 bg-[#1a1a1a] p-4 rounded-xl mb-3">

                <Coins className="text-yellow-400" />

                <div>
                  <p className="font-semibold">Buy Gold</p>
                  <p className="text-gray-400 text-sm">From ₹10</p>
                </div>

              </div>


              {/* Live Price */}

              <div className="flex items-center gap-3 bg-[#1a1a1a] p-4 rounded-xl mb-3">

                <TrendingUp className="text-yellow-400" />

                <div>
                  <p className="font-semibold">Live Price</p>
                  <p className="text-gray-400 text-sm">₹6,554/g</p>
                </div>

              </div>


              {/* Vault */}

              <div className="flex items-center gap-3 bg-[#1a1a1a] p-4 rounded-xl">

                <Shield className="text-yellow-400" />

                <div>
                  <p className="font-semibold">Insured Vault</p>
                  <p className="text-gray-400 text-sm">100% Secure</p>
                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}