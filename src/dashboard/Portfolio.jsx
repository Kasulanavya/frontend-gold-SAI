
import { TrendingUp, Coins, Wallet, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

function Portfolio() {

  const totalGold = 37.5;
  const investment = 218630;
  const currentValue = 245830;
  const profit = currentValue - investment;

  const chartData = [
    { day: "Mon", price: 6420 },
    { day: "Tue", price: 6450 },
    { day: "Wed", price: 6480 },
    { day: "Thu", price: 6520 },
    { day: "Fri", price: 6550 },
    { day: "Sat", price: 6530 },
    { day: "Sun", price: 6580 }
  ];

  return (

    <div className="space-y-10 max-w-6xl mx-auto">

      {/* PORTFOLIO HERO CARD */}

      <div className="relative bg-gradient-to-br from-[#111] to-[#0b0b0b] border border-yellow-500/20 rounded-3xl p-10 overflow-hidden">

        {/* gold glow */}

        <div className="absolute -top-20 -right-20 w-[350px] h-[350px] bg-yellow-500/20 blur-[150px] rounded-full"></div>

        <div className="relative flex justify-between items-center">

          <div>

            <p className="text-white/60 text-sm">
              Total Portfolio Value
            </p>

            <h2 className="text-4xl font-bold text-yellow-400 mt-1">
              ₹{currentValue.toLocaleString()}
            </h2>

            <p className="text-green-400 flex items-center gap-1 mt-2 text-sm">
              <TrendingUp size={16}/>
              +₹{profit.toLocaleString()} returns
            </p>

          </div>

          <div className="text-right">

            <p className="text-white/60 text-sm">
              Gold Holdings
            </p>

            <h3 className="text-3xl font-bold">
              {totalGold} g
            </h3>

          </div>

        </div>

      </div>

      {/* PORTFOLIO STATS */}

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-[#111] border border-white/10 rounded-xl p-6 flex items-center gap-4">

          <Coins className="text-yellow-400"/>

          <div>
            <p className="text-white/60 text-sm">
              Gold Owned
            </p>

            <p className="text-xl font-semibold">
              {totalGold} grams
            </p>
          </div>

        </div>

        <div className="bg-[#111] border border-white/10 rounded-xl p-6 flex items-center gap-4">

          <Wallet className="text-yellow-400"/>

          <div>
            <p className="text-white/60 text-sm">
              Total Invested
            </p>

            <p className="text-xl font-semibold">
              ₹{investment.toLocaleString()}
            </p>
          </div>

        </div>

        <div className="bg-[#111] border border-white/10 rounded-xl p-6 flex items-center gap-4">

          <BarChart3 className="text-yellow-400"/>

          <div>
            <p className="text-white/60 text-sm">
              Profit
            </p>

            <p className="text-xl font-semibold text-green-400">
              ₹{profit.toLocaleString()}
            </p>
          </div>

        </div>

      </div>

      {/* PORTFOLIO CHART */}

      <div className="bg-[#111] border border-white/10 rounded-2xl p-8">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h3 className="text-xl font-semibold">
              Gold Price Trend
            </h3>

            <p className="text-white/50 text-sm">
              Last 7 days
            </p>

          </div>

          <span className="bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm">
            +1.14%
          </span>

        </div>

        <div className="h-64">

          <ResponsiveContainer width="100%" height="100%">

            <AreaChart data={chartData}>

              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>

                </linearGradient>
              </defs>

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill:"#888", fontSize:12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill:"#888", fontSize:12 }}
                tickFormatter={(v)=>`₹${v}`}
              />

              <Tooltip
                cursor={false}
                contentStyle={{
                  background:"#111",
                  border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:"10px",
                  color:"#fff"
                }}
                formatter={(v)=>`₹${v}`}
              />

              <Area
                type="monotone"
                dataKey="price"
                stroke="#fbbf24"
                strokeWidth={3}
                fill="url(#goldGradient)"
                dot={false}
                activeDot={{
                  r:5,
                  fill:"#fbbf24",
                  stroke:"#fff",
                  strokeWidth:2
                }}
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* TRANSACTIONS */}

      <div className="bg-[#111] border border-white/10 rounded-2xl p-8">

        <h3 className="text-xl font-semibold mb-6">
          Recent Transactions
        </h3>

        <div className="space-y-4 text-sm">

          <div className="flex justify-between border-b border-white/10 pb-3">
            <span>Buy Gold</span>
            <span>₹5,000</span>
          </div>

          <div className="flex justify-between border-b border-white/10 pb-3">
            <span>Buy Gold</span>
            <span>₹10,000</span>
          </div>

          <div className="flex justify-between">
            <span>Sell Gold</span>
            <span>₹3,000</span>
          </div>

        </div>

      </div>

    </div>

  );
}

export default Portfolio;