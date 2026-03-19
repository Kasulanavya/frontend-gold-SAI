import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const userInitial = "R"; // later make dynamic

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
    window.location.reload();
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

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 text-black font-bold flex items-center justify-center rounded-lg">
              SG
            </div>
            <div className="text-xl font-semibold">
              <span className="text-white">SabPe</span>
              <span className="text-yellow-400"> Gold</span>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center space-x-8">

            <Link to="/" className="text-white/80 hover:text-yellow-400">
              Home
            </Link>

            <Link to="/products" className="text-white/80 hover:text-yellow-400">
              Products
            </Link>

            <Link to="/mobile" className="text-white/80 hover:text-yellow-400">
  Mobile App
</Link>

            <Link to="/features" className="text-white/80 hover:text-yellow-400">
              Features
            </Link>

            <Link to="/how-it-works" className="text-white/80 hover:text-yellow-400">
              How It Works
            </Link>

            <Link to="/why" className="text-white/80 hover:text-yellow-400">
              Why SabPe
            </Link>

            <Link to="/faq" className="text-white/80 hover:text-yellow-400">
              FAQ
            </Link>

            {/* AUTH */}
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="text-white border border-yellow-400 px-5 py-2 rounded-full hover:bg-yellow-400 hover:text-black transition"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition"
                >
                  Start Investing
                </Link>
              </>
            ) : (
              <div className="relative group">

                {/* Profile Icon */}
                <div className="w-10 h-10 bg-yellow-400 text-black font-bold flex items-center justify-center rounded-full cursor-pointer">
                  {userInitial}
                </div>

                {/* Dropdown */}
                <div className="absolute right-0 mt-3 w-48 bg-black border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200">
                  
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 text-white hover:bg-white/10"
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/10"
                  >
                    Logout
                  </button>

                </div>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="lg:hidden text-white text-3xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="lg:hidden bg-black border-t border-white/10 py-6 flex flex-col items-center space-y-6">

            <Link to="/" onClick={() => setMenuOpen(false)} className="text-white text-lg">
              Home
            </Link>

            <Link to="/products" onClick={() => setMenuOpen(false)} className="text-white text-lg">
              Products 
            </Link>
            <Link to="/mobile" onClick={() => setMenuOpen(false)} className="text-white text-lg">
              Mobile App
            </Link>
            <Link to="/features" onClick={() => setMenuOpen(false)} className="text-white text-lg">
              Features
            </Link>

            <Link to="/how-it-works" onClick={() => setMenuOpen(false)} className="text-white text-lg">
              How It Works
            </Link>

            <Link to="/why" onClick={() => setMenuOpen(false)} className="text-white text-lg">
              Why SabPe
            </Link>

            <Link to="/faq" onClick={() => setMenuOpen(false)} className="text-white text-lg">
              FAQ
            </Link>

            {!isLoggedIn ? (
              <>
                <Link to="/login" className="text-white border border-yellow-400 px-6 py-2 rounded-full">
                  Login
                </Link>

                <Link to="/signup" className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold">
                  Start Investing
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold">
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-white border border-red-500 px-6 py-2 rounded-full"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;