import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToSection = (id) => {
    navigate("/");

    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);

    setMenuOpen(false);
  };

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
          <div
            onClick={() => goToSection("home")}
            className="flex items-center gap-3 cursor-pointer"
          >
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
            <button
              onClick={() => goToSection("home")}
              className="text-white/80 hover:text-yellow-400"
            >
              Home
            </button>

            <button
              onClick={() => goToSection("features")}
              className="text-white/80 hover:text-yellow-400"
            >
              Features
            </button>

            <button
              onClick={() => goToSection("how-it-works")}
              className="text-white/80 hover:text-yellow-400"
            >
              How It Works
            </button>

            <button
              onClick={() => goToSection("gold-prices")}
              className="text-white/80 hover:text-yellow-400"
            >
              Gold Prices
            </button>

            <button
              onClick={() => goToSection("faq")}
              className="text-white/80 hover:text-yellow-400"
            >
              FAQ
            </button>

            <button
              onClick={() => goToSection("contact")}
              className="text-white/80 hover:text-yellow-400"
            >
              Contact
            </button>

            {/* Login Button */}
            <Link
              to="/login"
              className="text-white border border-yellow-400 px-5 py-2 rounded-full hover:bg-yellow-400 hover:text-black transition"
            >
              Login
            </Link>

            {/* Signup Button */}
            <Link
              to="/signup"
              className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition"
            >
              Start Investing
            </Link>
          </div>

          {/* Hamburger Menu */}
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
            <button
              onClick={() => goToSection("home")}
              className="text-white text-lg"
            >
              Home
            </button>

            <button
              onClick={() => goToSection("features")}
              className="text-white text-lg"
            >
              Features
            </button>

            <button
              onClick={() => goToSection("how-it-works")}
              className="text-white text-lg"
            >
              How It Works
            </button>

            <button
              onClick={() => goToSection("gold-prices")}
              className="text-white text-lg"
            >
              Gold Prices
            </button>

            <button
              onClick={() => goToSection("faq")}
              className="text-white text-lg"
            >
              FAQ
            </button>

            <button
              onClick={() => goToSection("contact")}
              className="text-white text-lg"
            >
              Contact
            </button>

            {/* Login */}
            <Link
              to="/login"
              onClick={closeMenu}
              className="text-white border border-yellow-400 px-6 py-2 rounded-full"
            >
              Login
            </Link>

            {/* Signup */}
            <Link
              to="/signup"
              onClick={closeMenu}
              className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold"
            >
              Start Investing
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;