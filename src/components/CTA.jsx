import React from "react";
import { useNavigate } from "react-router-dom";

function CTA() {
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
    <section className="py-20 bg-black">
      <div className="max-w-4xl mx-auto px-4">

        <div className="relative rounded-2xl border border-yellow-500/20 p-10 text-center bg-gradient-to-br from-[#141414] to-[#0b0b0b] overflow-hidden">

          {/* 🔥 SOFT GLOW */}
          <div className="absolute inset-0 bg-yellow-500/10 blur-2xl opacity-30"></div>

          <div className="relative z-10">

            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Start Your Gold Journey
            </h2>

            <p className="text-gray-400 mt-3 mb-6 text-sm">
              Invest in digital gold instantly. Safe, secure and simple.
            </p>

            <button
              onClick={handleInvestClick}
              className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
            >
              Start Investing →
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}

export default CTA;