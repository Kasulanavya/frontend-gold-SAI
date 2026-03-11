import { ShieldCheck, Wallet, Mail, TrendingUp } from "lucide-react";

function Profile() {

  const user = {
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    gold: "37.5 g",
    portfolio: "₹2,45,830",
    returns: "+12.4%"
  };

  return (

    <div className="space-y-10 max-w-6xl mx-auto">

      {/* HERO PROFILE CARD */}

      <div className="relative bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-yellow-500/20 rounded-3xl p-10 flex items-center justify-between overflow-hidden">

        {/* gold glow */}
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-yellow-500/20 blur-[120px] rounded-full"></div>

        <div className="flex items-center gap-6">

          {/* avatar */}

          <div className="w-20 h-20 rounded-full bg-yellow-400 text-black flex items-center justify-center text-3xl font-bold">
            {user.name.charAt(0)}
          </div>

          {/* info */}

          <div>

            <h2 className="text-2xl font-bold">
              {user.name}
            </h2>

            <p className="text-white/60">
              {user.email}
            </p>

            <div className="flex items-center gap-2 mt-2 text-green-400 text-sm">
              <ShieldCheck size={16}/>
              KYC Verified
            </div>

          </div>

        </div>

        {/* portfolio highlight */}

        <div className="text-right">

          <p className="text-white/60 text-sm">
            Portfolio Value
          </p>

          <h3 className="text-3xl font-bold text-yellow-400">
            {user.portfolio}
          </h3>

          <p className="text-green-400 text-sm flex items-center justify-end gap-1">
            <TrendingUp size={14}/>
            {user.returns}
          </p>

        </div>

      </div>

      {/* ACCOUNT STATS */}

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-[#111] border border-white/10 rounded-xl p-6 flex items-center gap-4">

          <Wallet className="text-yellow-400"/>

          <div>
            <p className="text-white/60 text-sm">
              Gold Balance
            </p>

            <p className="text-xl font-semibold">
              {user.gold}
            </p>
          </div>

        </div>

        <div className="bg-[#111] border border-white/10 rounded-xl p-6 flex items-center gap-4">

          <Mail className="text-yellow-400"/>

          <div>
            <p className="text-white/60 text-sm">
              Email Address
            </p>

            <p className="text-xl font-semibold">
              {user.email}
            </p>
          </div>

        </div>

        <div className="bg-[#111] border border-white/10 rounded-xl p-6 flex items-center gap-4">

          <ShieldCheck className="text-yellow-400"/>

          <div>
            <p className="text-white/60 text-sm">
              Account Security
            </p>

            <p className="text-xl font-semibold text-green-400">
              Secure
            </p>
          </div>

        </div>

      </div>

      {/* SECURITY PANEL */}

      <div className="bg-[#111] border border-white/10 rounded-2xl p-8">

        <h3 className="text-xl font-semibold mb-6">
          Security Settings
        </h3>

        <div className="space-y-5 text-sm">

          <div className="flex justify-between border-b border-white/10 pb-3">
            <span>Password</span>
            <span className="text-white/60">
              Last updated 30 days ago
            </span>
          </div>

          <div className="flex justify-between border-b border-white/10 pb-3">
            <span>Two Factor Authentication</span>
            <span className="text-yellow-400">
              Enabled
            </span>
          </div>

          <div className="flex justify-between">
            <span>KYC Verification</span>
            <span className="text-green-400">
              Verified
            </span>
          </div>

        </div>

      </div>

      {/* ACTION BUTTON */}

      <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold px-10 py-4 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:scale-105 transition">

        Edit Profile

      </button>

    </div>

  );
}

export default Profile;