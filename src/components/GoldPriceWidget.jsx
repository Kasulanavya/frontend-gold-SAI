"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

const data = [
  { time: "9 AM", price: 6465 },
  { time: "10 AM", price: 6505 },
  { time: "11 AM", price: 6490 },
  { time: "12 PM", price: 6540 },
  { time: "1 PM", price: 6525 },
  { time: "2 PM", price: 6560 },
  { time: "3 PM", price: 6580 },
  { time: "4 PM", price: 6550 }
];

const cardAnimation = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 }
  })
};

function GoldPriceWidget() {
  return (
    <section className="py-28 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-yellow-500 font-semibold tracking-wider">
            MARKET DATA
          </p>

          <h2 className="text-4xl lg:text-5xl font-bold mt-2">
            Live Gold <span className="text-yellow-400">Prices</span>
          </h2>

          <p className="text-gray-400 mt-3">
            Track real-time gold prices and make informed investment decisions
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* LEFT PRICE CARDS */}

          <div className="space-y-6">

            {[
              {
                title: "Current Price",
                price: "₹6,554",
                sub: "/gram",
                extra: "+1.14%",
                color: "text-green-400"
              },
              {
                title: "Buy Price",
                price: "₹6,570",
                sub: "/gram",
                extra: "Inclusive GST"
              },
              {
                title: "Sell Price",
                price: "₹6,540",
                sub: "/gram",
                extra: "Instant Payout"
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                variants={cardAnimation}
                className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-7
                hover:border-yellow-500/30 transition-all"
              >
                <p className="text-gray-400 text-sm mb-2">
                  {card.title}
                </p>

                <div className="flex justify-between items-center">
                  <h3 className="text-4xl font-bold">
                    {card.price}
                    <span className="text-gray-400 text-lg ml-1">
                      {card.sub}
                    </span>
                  </h3>

                  <span className={`text-sm ${card.color || "text-gray-400"}`}>
                    {card.extra}
                  </span>
                </div>
              </motion.div>
            ))}

          </div>

          {/* RIGHT CHART */}
          {/* RIGHT CHART */}

<motion.div
  initial={{ opacity: 0, x: 60 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.7 }}
  className="bg-[#0f1115] border border-white/10 rounded-3xl p-8"
>

  <div className="flex justify-between items-center mb-6">

    <div>
      <h3 className="text-xl font-semibold">Price Trend</h3>
      <p className="text-gray-400 text-sm">
        Today's gold price movement
      </p>
    </div>

    <span className="bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm flex items-center gap-1">
      ↗ +1.14% Today
    </span>

  </div>

  <div className="h-64">

    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
      >

        <defs>
          <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.35}/>
            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
          </linearGradient>
        </defs>

        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6b7280", fontSize: 12 }}
          padding={{ left: 10, right: 10 }}
        />

        <YAxis
          domain={[6460, 6590]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6b7280", fontSize: 12 }}
          tickFormatter={(v) => `₹${v}`}
        />

        <Tooltip
          cursor={false}
          contentStyle={{
            background: "#111",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            color: "#fff"
          }}
          formatter={(v) => `₹${v}/g`}
        />

        <Area
          type="monotone"
          dataKey="price"
          stroke="#fbbf24"
          strokeWidth={3}
          fill="url(#gold)"
          dot={false}
          activeDot={{
            r: 5,
            fill: "#fbbf24",
            stroke: "#fff",
            strokeWidth: 2
          }}
        />

      </AreaChart>
    </ResponsiveContainer>

  </div>

</motion.div>

          {/* <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-[#0f0f0f] border border-yellow-500/20 rounded-3xl p-8"
          >

            <div className="flex justify-between items-center mb-6">

              <div>
                <h3 className="text-xl font-semibold">Price Trend</h3>
                <p className="text-gray-400 text-sm">
                  Today's gold price movement
                </p>
              </div>

              <span className="bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm">
                +1.14% Today
              </span>

            </div>

            <div className="h-64">

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>

                  <defs>
                    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#facc15" stopOpacity={0.45}/>
                      <stop offset="100%" stopColor="#facc15" stopOpacity={0}/>
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    stroke="#777"
                  />

                  <Tooltip
                    cursor={{
                      stroke: "#fff",
                      strokeWidth: 1,
                      strokeDasharray: "3 3"
                    }}
                    contentStyle={{
                      background: "#111",
                      border: "none",
                      borderRadius: "12px"
                    }}
                    formatter={(v) => `₹${v}/g`}
                  />

                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#facc15"
                    strokeWidth={3}
                    fill="url(#gold)"
                    dot={false}
                    activeDot={{
                      r: 6,
                      stroke: "#fff",
                      strokeWidth: 2,
                      fill: "#facc15"
                    }}
                  />

                </AreaChart>
              </ResponsiveContainer>

            </div>

          </motion.div> */}

        </div>

        {/* BUTTONS */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-6 mt-14 flex-col sm:flex-row"
        >

          <button className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold px-8 py-4 rounded-full hover:scale-105 transition">
            Buy Gold Now
          </button>

          <button className="flex-1 border border-yellow-500 text-yellow-400 px-8 py-4 rounded-full hover:bg-yellow-500 hover:text-black transition">
            Sell Gold
          </button>

        </motion.div>

      </div>
    </section>
  );
}

export default GoldPriceWidget;