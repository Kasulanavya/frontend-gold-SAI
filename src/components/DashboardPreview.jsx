import { User, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardPreview() {
  const navigate = useNavigate();

  const cards = [
    {
      key: "portfolio",
      title: "Portfolio",
      description:
        "View your gold holdings, portfolio value, and manage buys/sells all from one place.",
      Icon: PieChart,
      action: () => navigate("/dashboard"),
    },
    {
      key: "profile",
      title: "Profile",
      description:
        "Update your account details and see your investment summary at a glance.",
      Icon: User,
      action: () => navigate("/dashboard/profile"),
    },
  ];

  return (
    <section className="bg-black text-white py-16 px-6 lg:px-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-yellow-500 opacity-10 blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-center text-4xl lg:text-5xl font-bold mb-4">
          Your Dashboard
        </h2>

        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
          Quickly access your account and portfolio tools to manage your gold investments.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card) => {
            const Icon = card.Icon;

            return (
              <button
                key={card.key}
                onClick={card.action}
                className="group text-left rounded-3xl border border-white/10 bg-gradient-to-b from-[#111] to-[#0b0b0b] p-8 hover:border-yellow-400/60 hover:shadow-[0_0_30px_rgba(255,204,0,0.25)] hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{card.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{card.description}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition">
                    <Icon size={26} className="text-yellow-400" />
                  </div>
                </div>
                <div className="mt-6 text-sm font-semibold text-yellow-400">
                  Explore →
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
