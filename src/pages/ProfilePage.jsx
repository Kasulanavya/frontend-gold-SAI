import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getUserProfile,
  setUserProfile,
  validateToken
} from "../api/authApi";
import {
  createAugmontUserBank,
  deleteAugmontUserBank,
  fetchAugmontAddresses,
  fetchAugmontPassbook,
  fetchAugmontKycProfile,
  fetchAugmontUserBanks,
  fetchAugmontUserProfile,
  getAugmontUser,
  updateAugmontKyc,
  updateAugmontUser,
  updateAugmontUserBank,
  updateAugmontWithdraw
} from "../api/augmontApi";
import {
  fetchSafeGoldUserBalance,
  fetchSafeGoldUserTransactions
} from "../api/safeGoldApi";

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

const buildAugmontIdCandidates = (latestProfile, storedAugmontUser) => {
  const candidates = [
    storedAugmontUser?.uniqueId,
    latestProfile?.uniqueId,
    storedAugmontUser?.customerMappedId,
    latestProfile?.customerMappedId
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return [...new Set(candidates)];
};

const renderKycValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Empty";
  }

  return String(value);
};

export default function Profile() {
  const initialProfile = useMemo(() => getUserProfile() || {}, []);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceMessage, setBalanceMessage] = useState("");
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsMessage, setTransactionsMessage] = useState("");
  const [passbookLoading, setPassbookLoading] = useState(false);
  const [passbookMessage, setPassbookMessage] = useState("");
  const [bankLoading, setBankLoading] = useState(false);
  const [bankMessage, setBankMessage] = useState("");
  const [kycLoading, setKycLoading] = useState(false);
  const [kycMessage, setKycMessage] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [name, setName] = useState(initialProfile.fullName || "User");
  const [phone, setPhone] = useState(initialProfile.mobileNumber || "");
  const [email, setEmail] = useState(initialProfile.email || "");
  const [stateName, setStateName] = useState(initialProfile.augmontState || "");
  const [cityName, setCityName] = useState(initialProfile.augmontCity || "");
  const [pinCode, setPinCode] = useState(initialProfile.pinCode || "");
  const [accountNumber, setAccountNumber] = useState(
    initialProfile.accountNumber || ""
  );
  const [accountName, setAccountName] = useState(
    initialProfile.accountName || initialProfile.fullName || ""
  );
  const [ifscCode, setIfscCode] = useState(initialProfile.ifscCode || "");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [bankAction, setBankAction] = useState("create");
  const [panNumber, setPanNumber] = useState(initialProfile.panNumber || "");
  const [dateOfBirth, setDateOfBirth] = useState(initialProfile.dateOfBirth || "");
  const [nameAsPerPan, setNameAsPerPan] = useState(
    initialProfile.nameAsPerPan || initialProfile.fullName || ""
  );
  const [sellTransactionId, setSellTransactionId] = useState("");
  const [withdrawStatus, setWithdrawStatus] = useState("processed");
  const [utrNumber, setUtrNumber] = useState("");
  const [backendStats, setBackendStats] = useState({
    investment: 0,
    holdings: 0,
    safeGoldName: "",
    safeGoldMobile: "",
    safeGoldPincode: "",
    kycStatus: "Pending",
    safeGoldKycRequirement: {
      identityRequired: false,
      panRequired: false
    },
    sellableBalance: 0,
    activities: [],
    transactionMeta: {
      previous: null,
      next: null
    },
    addresses: [],
    banks: [],
    passbook: {
      goldGrms: "0.0000",
      silverGrms: "0.0000"
    },
    linkedProviders: {
      augmontUniqueId: "",
      safeGoldPartnerUserId: ""
    }
  });
  const [kycProfile, setKycProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      const authResult = await validateToken();
      const latestProfile = getUserProfile() || initialProfile;
      const storedAugmontUser = getAugmontUser();
      const partnerUserId = latestProfile?.partnerUserId || "";
      const augmontIdCandidates = buildAugmontIdCandidates(
        latestProfile,
        storedAugmontUser
      );

      if (!isMounted) return;

      setName(latestProfile?.fullName || "User");
      setPhone(latestProfile?.mobileNumber || "");
      setEmail(latestProfile?.email || "");
      setStateName(latestProfile?.augmontState || "");
      setCityName(latestProfile?.augmontCity || "");
      setPinCode(latestProfile?.pinCode || "");
      setAccountNumber(latestProfile?.accountNumber || "");
      setAccountName(
        latestProfile?.accountName || latestProfile?.fullName || ""
      );
      setIfscCode(latestProfile?.ifscCode || "");
      setPanNumber(latestProfile?.panNumber || "");
      setDateOfBirth(latestProfile?.dateOfBirth || "");
      setNameAsPerPan(
        latestProfile?.nameAsPerPan || latestProfile?.fullName || ""
      );

      if (augmontIdCandidates.length === 0 && !partnerUserId) {
        setError("Backend user mapping is missing for this account.");
        setLoading(false);
        return;
      }

      let resolvedAugmontId = "";
      let userProfileResponse = null;
      let kycProfileResponse = null;
      let addressListResponse = null;
      let bankListResponse = null;

      for (const candidateId of augmontIdCandidates) {
        const profileResponse = await fetchAugmontUserProfile(candidateId);

        if (profileResponse?.ok) {
          resolvedAugmontId = candidateId;
          userProfileResponse = profileResponse;
          const [kycResponse, addressesResponse, banksResponse] = await Promise.all([
            fetchAugmontKycProfile(candidateId),
            fetchAugmontAddresses(candidateId),
            fetchAugmontUserBanks(candidateId)
          ]);
          kycProfileResponse = kycResponse;
          addressListResponse = addressesResponse;
          bankListResponse = banksResponse;
          break;
        }

        userProfileResponse = profileResponse;
      }

      const [safeGoldBalanceResponse, safeGoldTransactionsResponse] = await Promise.all([
        partnerUserId
          ? fetchSafeGoldUserBalance({ partnerUserId })
          : Promise.resolve(null),
        partnerUserId
          ? fetchSafeGoldUserTransactions({ partnerUserId })
          : Promise.resolve(null)
      ]);

      if (!isMounted) return;

      const augmontProfile = userProfileResponse?.profile || {};
      const balance = safeGoldBalanceResponse?.balance || {};
      const addresses = addressListResponse?.addresses || [];
      const banks = bankListResponse?.banks || [];
      const transactions = safeGoldTransactionsResponse?.transactions || [];
      const transactionMeta = safeGoldTransactionsResponse?.meta || {
        previous: null,
        next: null
      };
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
        uniqueId: resolvedAugmontId || latestProfile?.uniqueId || "",
        partnerUserId,
        customerMappedId:
          augmontProfile?.customerMappedId ||
          latestProfile?.customerMappedId ||
          storedAugmontUser?.customerMappedId ||
          "",
        augmontKycStatus:
          augmontProfile?.kycStatus ||
          kycProfileResponse?.kycProfile?.kycStatus ||
          kycProfileResponse?.kycProfile?.status ||
          ""
      });

      setName(backendName);
      setPhone(backendPhone);
      setEmail(backendEmail);
      setStateName(augmontProfile?.stateName || augmontProfile?.userState || latestProfile?.augmontState || "");
      setCityName(augmontProfile?.cityName || augmontProfile?.userCity || latestProfile?.augmontCity || "");
      setPinCode(augmontProfile?.userPincode || latestProfile?.pinCode || "");
      setAccountName((current) => current || backendName);
      setNameAsPerPan((current) => current || backendName);
      if (Array.isArray(banks) && banks.length > 0) {
        const primaryBank = banks[0] || {};
        setSelectedBankId(
          String(
            primaryBank?.userBankId ||
            primaryBank?.bankId ||
            primaryBank?.id ||
            ""
          )
        );
      }

      const activitiesSource = Array.isArray(transactions) ? transactions : [];

      setKycProfile(kycProfileResponse?.kycProfile || null);

      setBackendStats({
        investment: pickFirstNumber(balance?.investmentAmount, balance?.buyValue),
        holdings: pickFirstNumber(
          balance?.goldBalance,
          augmontProfile?.goldBalance,
          augmontProfile?.balance
        ),
        safeGoldName: balance?.name || latestProfile?.fullName || "",
        safeGoldMobile: balance?.mobileNo || latestProfile?.mobileNumber || "",
        safeGoldPincode: balance?.pinCode || latestProfile?.pinCode || "",
        sellableBalance: pickFirstNumber(balance?.sellableBalance),
        kycStatus:
          augmontProfile?.kycStatus ||
          kycProfileResponse?.kycProfile?.kycStatus ||
          kycProfileResponse?.kycProfile?.status ||
          (balance?.kycCompleted ? "Completed" : balance?.kycRequired ? "Required" : "") ||
          "Pending",
        safeGoldKycRequirement: balance?.kycRequirement || {
          identityRequired: false,
          panRequired: false
        },
        addresses: Array.isArray(addresses) ? addresses : [],
        banks: Array.isArray(banks) ? banks : [],
        passbook: {
          goldGrms: "0.0000",
          silverGrms: "0.0000"
        },
        linkedProviders: {
          augmontUniqueId: resolvedAugmontId,
          safeGoldPartnerUserId: partnerUserId
        },
        transactionMeta,
        activities: Array.isArray(activitiesSource)
          ? activitiesSource.slice(0, 5).map(formatActivity)
          : []
      });

      if (
        !authResult?.ok &&
        (!resolvedAugmontId || !userProfileResponse?.ok) &&
        (!partnerUserId || !safeGoldBalanceResponse?.ok) &&
        (!partnerUserId || !safeGoldTransactionsResponse?.ok)
      ) {
        setError("Unable to load profile data from backend.");
      } else if (
        (partnerUserId &&
          (!safeGoldBalanceResponse?.ok || !safeGoldTransactionsResponse?.ok))
      ) {
        setError(
          safeGoldBalanceResponse?.message ||
            safeGoldTransactionsResponse?.message ||
            "Some backend profile sections could not be loaded."
        );
      } else {
        setError("");
      }

      setLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [initialProfile]);

  const handleCheckBalance = async () => {
    const latestProfile = getUserProfile() || initialProfile;
    const partnerUserId = latestProfile?.partnerUserId || "";

    if (!partnerUserId) {
      setBalanceMessage("SafeGold partner user id is not available for this account.");
      return;
    }

    setBalanceLoading(true);
    setBalanceMessage("");

    const response = await fetchSafeGoldUserBalance({ partnerUserId });

    setBalanceLoading(false);

    if (!response?.ok) {
      setBalanceMessage(response?.message || "Unable to fetch SafeGold balance.");
      return;
    }

    const balance = response.balance || {};

    setBackendStats((current) => ({
      ...current,
      investment: pickFirstNumber(balance?.investmentAmount, balance?.buyValue, current.investment),
      holdings: pickFirstNumber(balance?.goldBalance, current.holdings),
      safeGoldName: balance?.name || current.safeGoldName,
      safeGoldMobile: balance?.mobileNo || current.safeGoldMobile,
      safeGoldPincode: balance?.pinCode || current.safeGoldPincode,
      sellableBalance: pickFirstNumber(balance?.sellableBalance, current.sellableBalance),
      kycStatus:
        (balance?.kycCompleted ? "Completed" : balance?.kycRequired ? "Required" : "") ||
        current.kycStatus,
      safeGoldKycRequirement:
        balance?.kycRequirement || current.safeGoldKycRequirement,
      linkedProviders: {
        ...current.linkedProviders,
        safeGoldPartnerUserId: String(balance?.partnerUserId || partnerUserId)
      }
    }));

    setBalanceMessage("SafeGold balance updated successfully.");
  };

  const handleSave = async () => {
    const uniqueId = resolveAugmontUniqueId();

    if (!uniqueId) {
      setProfileMessage("Augmont unique id is not available for this account.");
      return;
    }

    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !stateName.trim() ||
      !cityName.trim() ||
      !pinCode.trim()
    ) {
      setProfileMessage("Name, mobile number, email, state, city, and pincode are required.");
      return;
    }

    setProfileSaving(true);
    setProfileMessage("");

    const response = await updateAugmontUser({
      uniqueId,
      request: {
        mobileNumber: phone.trim(),
        emailId: email.trim(),
        userName: name.trim(),
        stateName: stateName.trim(),
        cityName: cityName.trim(),
        userPincode: pinCode.trim()
      }
    });

    setProfileSaving(false);

    if (!response?.ok) {
      setProfileMessage(response?.message || "Unable to update Augmont user details.");
      return;
    }

    setUserProfile({
      fullName: name,
      email,
      mobileNumber: phone,
      pinCode,
      augmontState: stateName,
      augmontCity: cityName,
      accountNumber,
      accountName,
      ifscCode,
      panNumber,
      dateOfBirth,
      nameAsPerPan
    });
    setProfileMessage("Augmont user details updated successfully.");
    setEditing(false);
  };

  const resolveAugmontUniqueId = () => {
    const latestProfile = getUserProfile() || initialProfile;
    return (
      backendStats.linkedProviders.augmontUniqueId ||
      latestProfile?.uniqueId ||
      ""
    );
  };

  const handleFetchPassbook = async () => {
    const uniqueId = resolveAugmontUniqueId();

    if (!uniqueId) {
      setPassbookMessage("Augmont unique id is not available for this account.");
      return;
    }

    setPassbookLoading(true);
    setPassbookMessage("");

    const response = await fetchAugmontPassbook(uniqueId);

    setPassbookLoading(false);

    if (!response?.ok) {
      setPassbookMessage(response?.message || "Unable to fetch Augmont passbook.");
      return;
    }

    setBackendStats((current) => ({
      ...current,
      passbook: {
        goldGrms: String(response?.passbook?.goldGrms || "0.0000"),
        silverGrms: String(response?.passbook?.silverGrms || "0.0000")
      }
    }));
    setPassbookMessage("Augmont passbook updated successfully.");
  };

  const handleCreateBank = async () => {
    const uniqueId = resolveAugmontUniqueId();

    if (!uniqueId) {
      setBankMessage("Augmont unique id is not available for this account.");
      return;
    }

    if (!accountNumber.trim() || !accountName.trim() || !ifscCode.trim()) {
      setBankMessage("Account number, account name, and IFSC code are required.");
      return;
    }

    setBankLoading(true);
    setBankMessage("");

    const response =
      bankAction === "update" && selectedBankId
        ? await updateAugmontUserBank({
            uniqueId,
            userBankId: selectedBankId,
            request: {
              accountNumber: accountNumber.trim(),
              accountName: accountName.trim(),
              ifscCode: ifscCode.trim(),
              status: "active"
            }
          })
        : await createAugmontUserBank({
            uniqueId,
            request: {
              accountNumber: accountNumber.trim(),
              accountName: accountName.trim(),
              ifscCode: ifscCode.trim()
            }
          });

    setBankLoading(false);

    if (!response?.ok) {
      setBankMessage(response?.message || "Unable to create Augmont bank details.");
      return;
    }

    setUserProfile({
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      ifscCode: ifscCode.trim()
    });

    const banksResponse = await fetchAugmontUserBanks(uniqueId);
    if (banksResponse?.ok) {
      setBackendStats((current) => ({
        ...current,
        banks: banksResponse.banks || []
      }));
    }

    setBankMessage(
      bankAction === "update"
        ? "Augmont bank details updated successfully."
        : "Augmont bank details saved successfully."
    );
    setBankAction("create");
    setSelectedBankId("");
  };

  const handleEditBank = (bank) => {
    setAccountNumber(
      String(bank?.accountNumber || bank?.account_number || "")
    );
    setAccountName(
      String(bank?.accountName || bank?.account_holder_name || bank?.name || "")
    );
    setIfscCode(String(bank?.ifscCode || bank?.ifsc || "").toUpperCase());
    setSelectedBankId(
      String(bank?.userBankId || bank?.bankId || bank?.id || "")
    );
    setBankAction("update");
    setBankMessage("");
  };

  const handleDeleteBank = async (bank) => {
    const uniqueId = resolveAugmontUniqueId();
    const userBankId = String(bank?.userBankId || bank?.bankId || bank?.id || "");

    if (!uniqueId || !userBankId) {
      setBankMessage("Bank id is not available for delete.");
      return;
    }

    setBankLoading(true);
    setBankMessage("");

    const response = await deleteAugmontUserBank({
      uniqueId,
      userBankId
    });

    setBankLoading(false);

    if (!response?.ok) {
      setBankMessage(response?.message || "Unable to delete Augmont bank.");
      return;
    }

    const banksResponse = await fetchAugmontUserBanks(uniqueId);
    if (banksResponse?.ok) {
      setBackendStats((current) => ({
        ...current,
        banks: banksResponse.banks || []
      }));
    } else {
      setBackendStats((current) => ({
        ...current,
        banks: current.banks.filter((item) => {
          const currentBankId = String(
            item?.userBankId || item?.bankId || item?.id || ""
          );
          return currentBankId !== userBankId;
        })
      }));
    }

    if (selectedBankId === userBankId) {
      setSelectedBankId("");
      setBankAction("create");
      setAccountNumber("");
      setAccountName(name || "");
      setIfscCode("");
    }

    setBankMessage("Augmont bank deleted successfully.");
  };

  const handleUpdateKyc = async () => {
    const uniqueId = resolveAugmontUniqueId();

    if (!uniqueId) {
      setKycMessage("Augmont unique id is not available for this account.");
      return;
    }

    if (!panNumber.trim() || !dateOfBirth.trim() || !nameAsPerPan.trim()) {
      setKycMessage("PAN number, date of birth, and name as per PAN are required.");
      return;
    }

    setKycLoading(true);
    setKycMessage("");

    const response = await updateAugmontKyc({
      uniqueId,
      request: {
        panNumber: panNumber.trim().toUpperCase(),
        dateOfBirth: dateOfBirth.trim(),
        nameAsPerPan: nameAsPerPan.trim(),
        status: "approved"
      }
    });

    setKycLoading(false);

    if (!response?.ok) {
      setKycMessage(response?.message || "Unable to update Augmont KYC.");
      return;
    }

    const refreshedKycResponse = await fetchAugmontKycProfile(uniqueId);
    if (refreshedKycResponse?.ok) {
      setKycProfile(refreshedKycResponse.kycProfile || null);
      setBackendStats((current) => ({
        ...current,
        kycStatus:
          refreshedKycResponse?.kycProfile?.kycStatus ||
          refreshedKycResponse?.kycProfile?.status ||
          current.kycStatus
      }));
    }

    setUserProfile({
      panNumber: panNumber.trim().toUpperCase(),
      dateOfBirth: dateOfBirth.trim(),
      nameAsPerPan: nameAsPerPan.trim()
    });

    setKycMessage("Augmont KYC details saved successfully.");
  };

  const handleUpdateWithdraw = async () => {
    const uniqueId = resolveAugmontUniqueId();

    if (!uniqueId) {
      setWithdrawMessage("Augmont unique id is not available for this account.");
      return;
    }

    if (!sellTransactionId.trim() || !withdrawStatus.trim() || !utrNumber.trim()) {
      setWithdrawMessage("Sell transaction id, withdraw status, and UTR number are required.");
      return;
    }

    setWithdrawLoading(true);
    setWithdrawMessage("");

    const response = await updateAugmontWithdraw({
      sellTransactionId: sellTransactionId.trim(),
      uniqueId,
      request: {
        withdrawStatus: withdrawStatus.trim(),
        utrNumber: utrNumber.trim()
      }
    });

    setWithdrawLoading(false);

    if (!response?.ok) {
      setWithdrawMessage(response?.message || "Unable to update withdraw details.");
      return;
    }

    setWithdrawMessage("Withdraw details updated successfully.");
  };

  const handleFetchTransactions = async () => {
    const latestProfile = getUserProfile() || initialProfile;
    const partnerUserId = latestProfile?.partnerUserId || "";

    if (!partnerUserId) {
      setTransactionsMessage("SafeGold partner user id is not available for this account.");
      return;
    }

    setTransactionsLoading(true);
    setTransactionsMessage("");

    const response = await fetchSafeGoldUserTransactions({ partnerUserId });

    setTransactionsLoading(false);

    if (!response?.ok) {
      setTransactionsMessage(response?.message || "Unable to fetch SafeGold transactions.");
      return;
    }

    const transactions = Array.isArray(response.transactions) ? response.transactions : [];

    setBackendStats((current) => ({
      ...current,
      transactionMeta: response.meta || current.transactionMeta,
      activities: transactions.slice(0, 10).map(formatActivity)
    }));

    setTransactionsMessage(
      transactions.length > 0
        ? "Transactions updated successfully."
        : "Empty transactions."
    );
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
                    placeholder="Full name"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-black border px-3 py-1 rounded block mt-2"
                    placeholder="Mobile number"
                  />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black border px-3 py-1 rounded block mt-2"
                    placeholder="Email"
                  />
                  <input
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="bg-black border px-3 py-1 rounded block mt-2"
                    placeholder="State"
                  />
                  <input
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="bg-black border px-3 py-1 rounded block mt-2"
                    placeholder="City"
                  />
                  <input
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                    className="bg-black border px-3 py-1 rounded block mt-2"
                    placeholder="Pincode"
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
              disabled={profileSaving}
              className="bg-green-500 px-5 py-2 rounded-lg text-black disabled:opacity-60"
            >
              {profileSaving ? "Saving..." : "Save"}
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

        {profileMessage ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            {profileMessage}
          </div>
        ) : null}

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

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/5 p-6 rounded-xl">
            <p className="text-white/60">Sellable Balance</p>
            <h3 className="text-2xl font-bold">
              {loading ? "Loading..." : `${backendStats.sellableBalance.toFixed(4)}g`}
            </h3>
          </div>

          <div className="bg-white/5 p-6 rounded-xl">
            <p className="text-white/60">Augmont Unique ID</p>
            <h3 className="text-sm font-semibold break-all">
              {loading ? "Loading..." : backendStats.linkedProviders.augmontUniqueId || "Not linked"}
            </h3>
          </div>

          <div className="bg-white/5 p-6 rounded-xl">
            <p className="text-white/60">SafeGold Partner User ID</p>
            <h3 className="text-sm font-semibold break-all">
              {loading
                ? "Loading..."
                : backendStats.linkedProviders.safeGoldPartnerUserId || "Not linked"}
            </h3>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">SafeGold Balance</h3>
              <p className="mt-1 text-sm text-white/60">
                Use this button to fetch the latest SafeGold balance from the wrapper backend.
              </p>
            </div>
            <button
              onClick={handleCheckBalance}
              disabled={loading || balanceLoading}
              className="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-black disabled:opacity-60"
            >
              {balanceLoading ? "Checking..." : "Check Balance"}
            </button>
          </div>
          {balanceMessage ? (
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white/80">
              {balanceMessage}
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Gold Balance</p>
              <h4 className="mt-2 text-2xl font-bold text-yellow-400">
                {loading ? "Loading..." : `${backendStats.holdings.toFixed(4)}g`}
              </h4>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Sellable Balance</p>
              <h4 className="mt-2 text-2xl font-bold text-white">
                {loading ? "Loading..." : `${backendStats.sellableBalance.toFixed(4)}g`}
              </h4>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">SafeGold Transactions</h3>
              <p className="mt-1 text-sm text-white/60">
                Fetch the latest SafeGold transaction history from the wrapper backend.
              </p>
            </div>
            <button
              onClick={handleFetchTransactions}
              disabled={loading || transactionsLoading}
              className="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-black disabled:opacity-60"
            >
              {transactionsLoading ? "Fetching..." : "Fetch Transactions"}
            </button>
          </div>
          {transactionsMessage ? (
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white/80">
              {transactionsMessage}
            </div>
          ) : null}

        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Augmont Passbook</h3>
              <p className="mt-1 text-sm text-white/60">
                Fetch the latest Augmont passbook balances from the wrapper backend.
              </p>
            </div>
            <button
              onClick={handleFetchPassbook}
              disabled={loading || passbookLoading}
              className="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-black disabled:opacity-60"
            >
              {passbookLoading ? "Fetching..." : "Fetch Passbook"}
            </button>
          </div>

          {passbookMessage ? (
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white/80">
              {passbookMessage}
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Gold Grams</p>
              <h4 className="mt-2 text-2xl font-bold text-yellow-400">
                {loading ? "Loading..." : String(backendStats.passbook?.goldGrms || "0.0000")}
              </h4>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Silver Grams</p>
              <h4 className="mt-2 text-2xl font-bold text-white">
                {loading ? "Loading..." : String(backendStats.passbook?.silverGrms || "0.0000")}
              </h4>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Augmont Bank Details</h3>
              <p className="mt-1 text-sm text-white/60">
                Add, update, or delete your bank account details for Augmont sell flow.
              </p>
            </div>
            <button
              onClick={handleCreateBank}
              disabled={loading || bankLoading}
              className="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-black disabled:opacity-60"
            >
              {bankLoading ? "Saving..." : bankAction === "update" ? "Update Bank Details" : "Save Bank Details"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setBankAction("create");
                setSelectedBankId("");
                setAccountNumber("");
                setAccountName(name || "");
                setIfscCode("");
                setBankMessage("");
              }}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80"
            >
              New Bank
            </button>
            {bankAction === "update" ? (
              <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-100">
                Editing selected bank
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Account Number
              </label>
              <input
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ""))}
                placeholder="Enter account number"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Account Name
              </label>
              <input
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                placeholder="Enter account name"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                IFSC Code
              </label>
              <input
                value={ifscCode}
                onChange={(event) => setIfscCode(event.target.value.toUpperCase())}
                placeholder="Enter IFSC code"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          {bankMessage ? (
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white/80">
              {bankMessage}
            </div>
          ) : null}

          <div className="mt-6">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/60">
              Saved Banks
            </h4>
            <div className="mt-3 space-y-3">
              {loading ? (
                <p className="text-white/60">Loading bank details...</p>
              ) : backendStats.banks.length === 0 ? (
                <p className="text-white/60">No saved bank accounts available.</p>
              ) : (
                backendStats.banks.map((bank, index) => {
                  const bankId = String(
                    bank?.userBankId || bank?.bankId || bank?.id || `bank-${index}`
                  );
                  const savedAccountName =
                    bank?.accountName || bank?.account_holder_name || bank?.name || "Bank Account";
                  const savedAccountNumber =
                    bank?.accountNumber || bank?.account_number || "No account number";
                  const savedIfsc = bank?.ifscCode || bank?.ifsc || "No IFSC";

                  return (
                    <div
                      key={bankId}
                      className="rounded-lg border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-white">{savedAccountName}</p>
                          <p className="text-sm text-white/60">{savedAccountNumber}</p>
                          <p className="text-xs text-white/40">{savedIfsc}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditBank(bank)}
                            className="rounded-lg border border-yellow-400/20 px-3 py-2 text-sm text-yellow-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBank(bank)}
                            className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Augmont KYC Details</h3>
              <p className="mt-1 text-sm text-white/60">
                Add your PAN and date of birth details for Augmont KYC update.
              </p>
            </div>
            <button
              onClick={handleUpdateKyc}
              disabled={loading || kycLoading}
              className="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-black disabled:opacity-60"
            >
              {kycLoading ? "Saving..." : "Save KYC Details"}
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                PAN Number
              </label>
              <input
                value={panNumber}
                onChange={(event) => setPanNumber(event.target.value.toUpperCase())}
                placeholder="Enter PAN number"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Name As Per PAN
              </label>
              <input
                value={nameAsPerPan}
                onChange={(event) => setNameAsPerPan(event.target.value)}
                placeholder="Enter name as per PAN"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          {kycMessage ? (
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white/80">
              {kycMessage}
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Withdraw Update</h3>
              <p className="mt-1 text-sm text-white/60">
                Update Augmont withdraw status using sell transaction id and UTR number.
              </p>
            </div>
            <button
              onClick={handleUpdateWithdraw}
              disabled={loading || withdrawLoading}
              className="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-black disabled:opacity-60"
            >
              {withdrawLoading ? "Saving..." : "Update Withdraw"}
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Sell Transaction ID
              </label>
              <input
                value={sellTransactionId}
                onChange={(event) => setSellTransactionId(event.target.value)}
                placeholder="Enter sell transaction id"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Withdraw Status
              </label>
              <input
                value={withdrawStatus}
                onChange={(event) => setWithdrawStatus(event.target.value)}
                placeholder="processed"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                UTR Number
              </label>
              <input
                value={utrNumber}
                onChange={(event) => setUtrNumber(event.target.value.toUpperCase())}
                placeholder="Enter UTR number"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          {withdrawMessage ? (
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white/80">
              {withdrawMessage}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 mt-6 lg:grid-cols-2">
          <div className="bg-white/5 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Saved Addresses</h3>
            <div className="space-y-3 text-white/70">
              {loading && <p>Loading saved addresses...</p>}
              {!loading && backendStats.addresses.length === 0 && (
                <p>No saved addresses available.</p>
              )}
              {!loading &&
                backendStats.addresses.map((address, index) => (
                  <div
                    key={`${address?.id || address?.addressId || index}`}
                    className="rounded-lg border border-white/10 p-3"
                  >
                    <p className="text-white">
                      {address?.address || address?.fullAddress || "Saved address"}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">KYC Profile</h3>
            {loading ? (
              <p className="text-white/70">Loading KYC profile...</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/50">PAN Number</p>
                  <p className="mt-2 text-sm text-white">
                    {renderKycValue(kycProfile?.panNumber)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/50">PAN Attachment</p>
                  <p className="mt-2 break-all text-sm text-white">
                    {renderKycValue(kycProfile?.panAttachment)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/50">Aadhaar Number</p>
                  <p className="mt-2 text-sm text-white">
                    {renderKycValue(kycProfile?.aadharNumber)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/50">Aadhaar Attachment</p>
                  <p className="mt-2 break-all text-sm text-white">
                    {renderKycValue(kycProfile?.aadharAttachment)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4 md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-white/50">Rejection Reason</p>
                  <p className="mt-2 text-sm text-white">
                    {renderKycValue(kycProfile?.rejectedReason)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-xl mt-6">
          <h3 className="text-lg font-semibold mb-4">SafeGold Transactions</h3>

          <div className="space-y-3 text-white/70">
            {loading && <p>Loading activity from backend...</p>}
            {!loading && backendStats.activities.length === 0 && (
              <p>Empty transactions.</p>
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
