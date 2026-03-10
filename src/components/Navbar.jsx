// import React, { useState, useEffect } from "react";

// function Navbar() {
//   const [isScrolled, setIsScrolled] = useState(false);

//   const menuItems = [
//     { name: "Home", link: "#home" },
//     { name: "Features", link: "#features" },
//     { name: "How It Works", link: "#how-it-works" },
//     { name: "Gold Prices", link: "#gold-prices" },
//     { name: "FAQ", link: "#faq" },
//     { name: "Contact", link: "#contact" },
//   ];

//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 40);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <nav
//       className={`fixed top-0 w-full z-50 transition-all duration-300 ${
//         isScrolled
//           ? "bg-black/90 backdrop-blur-md border-b border-white/10"
//           : "bg-black"
//       }`}
//     >
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="flex items-center justify-between h-20">

//           {/* Logo */}
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center font-bold text-black">
//               SG
//             </div>

//             <div className="text-lg font-semibold text-white">
//               SabPe <span className="text-yellow-400">Gold</span>
//             </div>
//           </div>

//           {/* Desktop Menu */}
//           <div className="hidden lg:flex items-center gap-10 text-sm text-white/70">

//             {menuItems.map((item) => (
//               <a
//                 key={item.name}
//                 href={item.link}
//                 className="hover:text-yellow-400 transition"
//               >
//                 {item.name}
//               </a>
//             ))}

//           </div>

//           {/* CTA Button */}
//           <button className="bg-yellow-400 text-black px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-yellow-400/30 hover:scale-105 transition">
//             Start Investing
//           </button>

//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;
import { useState, useEffect } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition ${
        isScrolled
          ? "bg-black/95 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">

        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 bg-yellow-400 text-black font-bold flex items-center justify-center rounded-lg">
              SG
            </div>

            <div className="text-xl font-semibold">
              <span className="text-white">SabPe</span>
              <span className="text-yellow-400"> Gold</span>
            </div>

          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">

            <a href="#home" className="text-white/80 hover:text-yellow-400">
              Home
            </a>

            <a href="#features" className="text-white/80 hover:text-yellow-400">
              Features
            </a>

            <a href="#how-it-works" className="text-white/80 hover:text-yellow-400">
              How It Works
            </a>

            <a href="#gold-prices" className="text-white/80 hover:text-yellow-400">
              Gold Prices
            </a>

            <a href="#faq" className="text-white/80 hover:text-yellow-400">
              FAQ
            </a>

            <a href="#contact" className="text-white/80 hover:text-yellow-400">
              Contact
            </a>

            <button className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold">
              Start Investing
            </button>

          </div>

          {/* Hamburger Button */}
          <button
            className="lg:hidden text-white text-3xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-black border-t border-white/10 py-6 flex flex-col items-center space-y-6">

            <a href="#home" onClick={closeMenu} className="text-white text-lg">
              Home
            </a>

            <a href="#features" onClick={closeMenu} className="text-white text-lg">
              Features
            </a>

            <a href="#how-it-works" onClick={closeMenu} className="text-white text-lg">
              How It Works
            </a>

            <a href="#gold-prices" onClick={closeMenu} className="text-white text-lg">
              Gold Prices
            </a>

            <a href="#faq" onClick={closeMenu} className="text-white text-lg">
              FAQ
            </a>

            <a href="#contact" onClick={closeMenu} className="text-white text-lg">
              Contact
            </a>

            <button
              onClick={closeMenu}
              className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold"
            >
              Start Investing
            </button>

          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;