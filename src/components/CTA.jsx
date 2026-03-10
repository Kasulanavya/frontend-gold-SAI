
import React from "react";

function CTA() {
  return (
    <section className="py-32 bg-black">
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative rounded-3xl border border-yellow-500/10 p-16 text-center overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0b0b0b]">

          {/* GOLD BACKGROUND GLOW */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-yellow-500/20"></div>

          {/* CENTER GOLD GLOW */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-yellow-500/20 blur-[180px] rounded-full"></div>

          {/* CONTENT */}
          <div className="relative z-10">

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Start Your Gold Journey <br />
              <span className="text-yellow-400">Today</span>
            </h2>

            <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">
              Join lakhs of Indians who are building wealth with digital gold.
              Start investing from just ₹10.
            </p>

            <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold px-10 py-4 rounded-full shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.7)] transition duration-300">
              Start Investing Now →
            </button>

          </div>

        </div>
      </div>
    </section>
  );
}

export default CTA;
