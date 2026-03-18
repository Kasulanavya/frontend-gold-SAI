import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState({
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    gold: "0.000 gm",
    portfolio: "₹0",
  });

  useEffect(() => {
    const updateFromStorage = () => {
      const storedGold = Number(localStorage.getItem("goldBalance") || 0);
      const storedPrice = Number(localStorage.getItem("goldPrice") || 0);
      const portfolioValue = storedPrice ? storedGold * storedPrice : 0;

      setUser((prev) => ({
        ...prev,
        gold: `${storedGold.toFixed(3)} gm`,
        portfolio: `₹${portfolioValue.toLocaleString()}`,
      }));
    };

    updateFromStorage();
    window.addEventListener("goldBalanceUpdated", updateFromStorage);
    return () =>
      window.removeEventListener("goldBalanceUpdated", updateFromStorage);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

      {/* 🔥 HEADER */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-400/20 rounded-3xl p-6 flex justify-between items-center">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-widest">
            Welcome back
          </p>
          <h1 className="text-3xl font-bold text-white mt-1">
            {user.name}
          </h1>
          <p className="text-white/60 mt-1">{user.email}</p>
        </div>

        <div className="w-16 h-16 rounded-full bg-yellow-400 text-black flex items-center justify-center text-xl font-bold shadow-lg">
          {user.name.charAt(0)}
        </div>
      </div>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#111] p-5 rounded-2xl border border-white/10 hover:scale-105 transition">
          <p className="text-white/50 text-xs">Portfolio Value</p>
          <h2 className="text-xl font-bold text-yellow-400 mt-1">
            {user.portfolio}
          </h2>
        </div>

        <div className="bg-[#111] p-5 rounded-2xl border border-white/10 hover:scale-105 transition">
          <p className="text-white/50 text-xs">Gold Balance</p>
          <h2 className="text-xl font-bold mt-1">
            {user.gold}
          </h2>
        </div>

        <div className="bg-[#111] p-5 rounded-2xl border border-white/10 hover:scale-105 transition">
          <p className="text-white/50 text-xs">Account Type</p>
          <h2 className="text-xl font-bold mt-1 text-green-400">
            Premium
          </h2>
        </div>
      </div>

      {/* 🔥 MAIN GRID */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* 🔥 HOLDINGS CARD */}
        <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-semibold mb-4">Your Holdings</h2>

          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Gold</span>
            <span>{user.gold}</span>
          </div>

          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Portfolio Value</span>
            <span>{user.portfolio}</span>
          </div>

          <div className="mt-6">
            <button className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold hover:scale-105 transition">
              Manage Investments
            </button>
          </div>
        </div>

        {/* 🔥 SECURITY CARD */}
        <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-semibold mb-4">Account Security</h2>

          <div className="space-y-4 text-sm text-white/60">
            <div className="flex justify-between">
              <span>Password</span>
              <span>Updated recently</span>
            </div>

            <div className="flex justify-between">
              <span>2FA</span>
              <span className="text-green-400">Enabled</span>
            </div>

            <div className="flex justify-between">
              <span>KYC Status</span>
              <span className="text-green-400">Verified</span>
            </div>
          </div>

          <button className="mt-6 w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl transition">
            Security Settings
          </button>
        </div>

      </div>

    </div>
  );
}