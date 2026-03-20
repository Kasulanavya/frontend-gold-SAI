import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getUserProfile,
  setUserProfile,
  validateToken
} from "../api/authApi";
import {
  fetchAugmontPassbook,
  fetchAugmontUserProfile,
  getAugmontUser
} from "../api/augmontApi";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const pickFirstNumber = (...values) => {
  for (const value of values) {
    const parsed = toNumber(value);
    if (parsed > 0) return parsed;
  }

  return 0;
};

const formatActivity = (entry, index) => {
  const source = entry || {};
  const amount = pickFirstNumber(
    source.amount,
    source.totalAmount,
    source.transactionAmount,
    source.buyPrice,
    source.sellPrice
  );
  const quantity = pickFirstNumber(
    source.goldBalance,
    source.balance,
    source.quantity,
    source.goldQuantity
  );
  const type =
    source.type ||
    source.transactionType ||
    source.txnType ||
    source.entryType ||
    "Activity";
  const date =
    source.createdAt ||
    source.date ||
    source.transactionDate ||
    source.updatedAt ||
    "";

  return {
    id: source.id || source.transactionId || source.txnId || `activity-${index}`,
    title: `${type}${quantity ? ` ${quantity}g` : ""}`,
    subtitle: amount ? currencyFormatter.format(amount) : "Recorded in backend",
    date: date ? new Date(date).toLocaleString() : "Recently updated"
  };
};

export default function Profile() {
  const initialProfile = useMemo(() => getUserProfile() || {}, []);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState(initialProfile.fullName || "User");
  const [phone, setPhone] = useState(initialProfile.mobileNumber || "");
  const [email, setEmail] = useState(initialProfile.email || "");
  const [backendStats, setBackendStats] = useState({
    investment: 0,
    holdings: 0,
    kycStatus: "Pending",
    activities: []
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      const authResult = await validateToken();
      const latestProfile = getUserProfile() || initialProfile;
      const storedAugmontUser = getAugmontUser();
      const uniqueId = latestProfile?.uniqueId || storedAugmontUser?.uniqueId || "";

      if (!isMounted) return;

      setName(latestProfile?.fullName || "User");
      setPhone(latestProfile?.mobileNumber || "");
      setEmail(latestProfile?.email || "");

      if (!uniqueId) {
        setError("Backend user mapping is missing for this account.");
        setLoading(false);
        return;
      }

      const [userProfileResponse, passbookResponse] = await Promise.all([
        fetchAugmontUserProfile(uniqueId),
        fetchAugmontPassbook(uniqueId)
      ]);

      if (!isMounted) return;

      const augmontProfile = userProfileResponse?.profile || {};
      const passbook = passbookResponse?.passbook || {};
      const backendName =
        augmontProfile?.userName ||
        augmontProfile?.name ||
        latestProfile?.fullName ||
        "User";
      const backendPhone =
        augmontProfile?.mobileNumber ||
        augmontProfile?.phone ||
        latestProfile?.mobileNumber ||
        "";
      const backendEmail =
        augmontProfile?.emailId ||
        augmontProfile?.email ||
        latestProfile?.email ||
        "";

      setUserProfile({
        fullName: backendName,
        mobileNumber: backendPhone,
        email: backendEmail,
        uniqueId
      });

      setName(backendName);
      setPhone(backendPhone);
      setEmail(backendEmail);

      const activitiesSource =
        passbook?.entries ||
        passbook?.transactions ||
        passbook?.passbook ||
        passbook?.data ||
        [];

      setBackendStats({
        investment: pickFirstNumber(
          passbook?.totalInvestment,
          passbook?.investedAmount,
          passbook?.investmentAmount
        ),
        holdings: pickFirstNumber(
          passbook?.goldBalance,
          passbook?.balance,
          augmontProfile?.goldBalance,
          augmontProfile?.balance
        ),
        kycStatus:
          augmontProfile?.kycStatus ||
          augmontProfile?.status ||
          augmontProfile?.userKycStatus ||
          "Pending",
        activities: Array.isArray(activitiesSource)
          ? activitiesSource.slice(0, 5).map(formatActivity)
          : []
      });

      if (!authResult?.ok && !userProfileResponse?.ok && !passbookResponse?.ok) {
        setError("Unable to load profile data from backend.");
      } else if (!userProfileResponse?.ok || !passbookResponse?.ok) {
        setError(
          userProfileResponse?.message ||
            passbookResponse?.message ||
            "Some backend profile sections could not be loaded."
        );
      }

      setLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [initialProfile]);

  const handleSave = () => {
    setUserProfile({
      fullName: name,
      email,
      mobileNumber: phone
    });
    setEditing(false);
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />

      <div className="pt-28 px-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-400/20 to-black border border-yellow-400/20 rounded-xl p-6 flex justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-400 text-black flex items-center justify-center rounded-full text-xl font-bold">
              {name.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              {editing ? (
                <>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black border px-3 py-1 rounded"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-black border px-3 py-1 rounded block mt-2"
                  />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black border px-3 py-1 rounded block mt-2"
                  />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">{name}</h2>
                  <p className="text-white/60">
                    {loading ? "Loading mobile..." : phone || "No mobile number available"}
                  </p>
                  <p className="text-white/40 text-sm">
                    {loading ? "Loading email..." : email || "No email available"}
                  </p>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <button
              onClick={handleSave}
              className="bg-green-500 px-5 py-2 rounded-lg text-black"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-yellow-400 px-5 py-2 rounded-lg text-black"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/5 p-6 rounded-xl">
            <p className="text-white/60">Total Investment</p>
            <h3 className="text-2xl font-bold text-yellow-400">
              {loading
                ? "Loading..."
                : currencyFormatter.format(backendStats.investment)}
            </h3>
          </div>

          <div className="bg-white/5 p-6 rounded-xl">
            <p className="text-white/60">Gold Holdings</p>
            <h3 className="text-2xl font-bold">
              {loading ? "Loading..." : `${backendStats.holdings.toFixed(4)}g`}
            </h3>
          </div>

          <div className="bg-white/5 p-6 rounded-xl">
            <p className="text-white/60">KYC Status</p>
            <h3 className="text-green-400 font-semibold">
              {loading ? "Loading..." : backendStats.kycStatus}
            </h3>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-xl mt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

          <div className="space-y-3 text-white/70">
            {loading && <p>Loading activity from backend...</p>}
            {!loading && backendStats.activities.length === 0 && (
              <p>No backend activity available.</p>
            )}
            {!loading &&
              backendStats.activities.map((activity) => (
                <div key={activity.id} className="rounded-lg border border-white/10 p-3">
                  <p className="text-white">{activity.title}</p>
                  <p className="text-sm text-white/60">{activity.subtitle}</p>
                  <p className="text-xs text-white/40">{activity.date}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
