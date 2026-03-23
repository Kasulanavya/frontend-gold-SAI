import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import { fetchLiveGoldRateSnapshot } from "../api/augmontApi";

export default function Dashboard() {
  const navigate = useNavigate();

  const [gold, setGold] = useState(0);
  const [value, setValue] = useState(0);
  const [invested, setInvested] = useState(0);

  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn");
    if (!logged) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const loadPortfolioSnapshot = async () => {
      const stored = Number(localStorage.getItem("goldBalance") || 0);
      setGold(stored);

      try {
        const rates = await fetchLiveGoldRateSnapshot();
        const price = Number(
          rates?.snapshot?.gold?.buyPrice || rates?.snapshot?.buyPrice || 0
        );

        localStorage.setItem("goldPrice", String(price));
        setValue(stored * price);
        setInvested(stored * price * 0.9);
      } catch (error) {
        console.log(error);
      }
    };

    loadPortfolioSnapshot();
    window.addEventListener("goldBalanceUpdated", loadPortfolioSnapshot);

    return () =>
      window.removeEventListener("goldBalanceUpdated", loadPortfolioSnapshot);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl space-y-8 p-6">
        <div className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-900/30 to-black p-10">
          <div>
            <h1 className="text-5xl font-bold">
              Welcome to <span className="text-yellow-400">SabPe Gold</span>
            </h1>
            <p className="mt-3 text-gray-400">
              Track. Invest. Grow your digital gold wealth.
            </p>
          </div>

          <button
            onClick={() => navigate("/portfolio")}
            className="rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black transition hover:scale-105"
          >
            Invest Now
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-[#111] p-6">
            <p className="text-gray-400">Portfolio Value</p>
            <h2 className="text-3xl text-yellow-400">
              Rs {value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="rounded-xl bg-[#111] p-6">
            <p className="text-gray-400">Gold</p>
            <h2 className="text-3xl">{gold.toFixed(3)} g</h2>
          </div>

          <div className="rounded-xl bg-[#111] p-6">
            <p className="text-gray-400">Invested</p>
            <h2 className="text-3xl">
              Rs {invested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h2>
          </div>
        </div>

        <div>
          <div className="mb-4 flex justify-between">
            <h2 className="text-xl font-semibold">Shop Gold</h2>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/gold-platform")}
                className="text-white/60 transition hover:text-yellow-300"
              >
                Goldplatform
              </button>
              <button
                onClick={() => navigate("/products")}
                className="text-yellow-400"
              >
                View All
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {["1g", "5g", "10g", "Custom"].map((item, index) => (
              <div
                key={index}
                onClick={() => navigate("/products")}
                className="cursor-pointer rounded-xl border border-transparent bg-[#111] p-4 hover:border-yellow-400"
              >
                <div className="mb-3 h-24 rounded bg-gradient-to-r from-yellow-400 to-yellow-600" />
                <p>{item} Gold</p>
                <p className="text-yellow-400">Rs 500+</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
