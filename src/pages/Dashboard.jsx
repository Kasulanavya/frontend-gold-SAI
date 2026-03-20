import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn");
    if (!logged) navigate("/login");
  }, [navigate]);

  return (
    <div className="bg-black min-h-screen text-white">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto p-6 space-y-8">

       

        {/* HERO */}
        <div className="bg-gradient-to-r from-yellow-900/30 to-black border border-yellow-500/20 rounded-2xl p-10 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold">
              Welcome to <span className="text-yellow-400">SabPe Gold ✨</span>
            </h1>
            <p className="text-gray-400 mt-3">
              Track. Invest. Grow your digital gold wealth.
            </p>
          </div>

          <button
  onClick={() => navigate("/portfolio")}
  className="bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition"
>
  Invest Now →
</button>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#111] p-6 rounded-xl">
            <p className="text-gray-400">Portfolio Value</p>
            <h2 className="text-3xl text-yellow-400">₹0.00</h2>
          </div>

          <div className="bg-[#111] p-6 rounded-xl">
            <p className="text-gray-400">Gold</p>
            <h2 className="text-3xl">0 g</h2>
          </div>

          <div className="bg-[#111] p-6 rounded-xl">
            <p className="text-gray-400">Invested</p>
            <h2 className="text-3xl">₹0</h2>
          </div>
        </div>

        {/* SHOP */}
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Shop Gold</h2>

            <button
              onClick={() => navigate("/products")}
              className="text-yellow-400"
            >
              View All →
            </button>
            
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {["1g", "5g", "10g", "Custom"].map((item, i) => (
              <div
                key={i}
                onClick={() => navigate("/products")}
                className="bg-[#111] p-4 rounded-xl cursor-pointer hover:border-yellow-400 border border-transparent"
              >
                <div className="h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded mb-3"></div>
                <p>{item} Gold</p>
                <p className="text-yellow-400">₹500+</p>
              </div>
            ))}
          </div>
        </div>

       
      </div>
    </div>
  );
}