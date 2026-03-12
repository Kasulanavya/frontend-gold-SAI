import { useState } from "react";
import { Coins, TrendingUp } from "lucide-react";

function BuyGold() {

  const goldPrice = 6554;
  const [amount, setAmount] = useState(5000.00);
const grams = (Number(amount) / goldPrice).toFixed(3);
const gst = (Number(amount) * 0.03).toFixed(2);
const total = (Number(amount) + Number(gst)).toFixed(2);
  
  return (

    <div className="max-w-5xl mx-auto space-y-10">

      {/* HERO CARD */}

      <div className="relative bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-yellow-500/20 rounded-3xl p-10 overflow-hidden">

        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-yellow-500/20 blur-[120px] rounded-full"></div>

        <div className="relative flex justify-between items-center">

          <div>

            <p className="text-white/60 text-sm">
              Live Gold Price
            </p>

            <h2 className="text-4xl font-bold text-yellow-400 mt-1">
              ₹{goldPrice}
            </h2>

            <p className="text-green-400 flex items-center gap-1 mt-2 text-sm">
              <TrendingUp size={14}/>
              +1.14% today
            </p>

          </div>

          <Coins size={40} className="text-yellow-400"/>

        </div>

      </div>

      {/* BUY PANEL */}

      <div className="bg-[#111] border border-white/10 rounded-2xl p-8 space-y-6">

        <h3 className="text-xl font-semibold">
          Buy Digital Gold
        </h3>

        {/* QUICK BUTTONS */}

        <div className="flex gap-4">

          {[1000,5000,10000,20000].map((value)=>(
            <button
              key={value}
              onClick={()=>setAmount(value)}
              className="px-5 py-2 border border-white/10 rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition"
            >
              ₹{value}
            </button>
          ))}

        </div>

        {/* INPUT */}

        <div>

          <label className="text-white/60 text-sm">
            Enter Amount
          </label>
<div className="relative mt-2">

  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
    ₹
  </span>

  <input
    type="text"
    value={amount}
    placeholder="Enter amount"
    onChange={(e) => {
      const val = e.target.value.replace(/[^0-9.]/g, "");
      setAmount(val);
    }}
    onBlur={() => {
      if (amount) {
        setAmount(Number(amount).toFixed(2));
      }
    }}
    className="w-full pl-8 bg-black border border-white/10 rounded-lg px-4 py-3 text-lg focus:border-yellow-400 outline-none"
  />

</div>
         

        </div>

        {/* CALCULATION */}

        <div className="bg-black border border-white/10 rounded-xl p-5 space-y-3">

          <div className="flex justify-between text-sm">
            <span className="text-white/60">Gold Quantity</span>
            <span>{grams} grams</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/60">GST (3%)</span>
            <span>₹{gst}</span>
          </div>

          <div className="flex justify-between text-lg font-semibold text-yellow-400">
            <span>Total Payable</span>
            <span>₹{total}</span>
          </div>

        </div>

        {/* BUY BUTTON */}

        <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold py-4 rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105 transition">
          Buy Gold
        </button>

      </div>

    </div>

  );
}

export default BuyGold;
