import React, { useState, useEffect } from "react";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  const menuItems = [
    { name: "Home", link: "#home" },
    { name: "Features", link: "#features" },
    { name: "How It Works", link: "#how-it-works" },
    { name: "Gold Prices", link: "#gold-prices" },
    { name: "FAQ", link: "#faq" },
    { name: "Contact", link: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/90 backdrop-blur-md border-b border-white/10"
          : "bg-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center font-bold text-black">
              SG
            </div>

            <div className="text-lg font-semibold text-white">
              SabPe <span className="text-yellow-400">Gold</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-10 text-sm text-white/70">

            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.link}
                className="hover:text-yellow-400 transition"
              >
                {item.name}
              </a>
            ))}

          </div>

          {/* CTA Button */}
          <button className="bg-yellow-400 text-black px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-yellow-400/30 hover:scale-105 transition">
            Start Investing
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;