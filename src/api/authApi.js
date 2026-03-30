const BASE_URL =
  import.meta.env.VITE_AUTH_BASE_URL?.trim() ||
  "https://uatauthbckend.karatly.net";
const USER_PROFILE_KEY = "userProfile";

const getJson = async (res) => {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      success: false,
      message: text || "Invalid server response"
    };
  }
};

const normalizeError = (error, fallbackMessage) => ({
  success: false,
  ok: false,
  message:
    error?.message === "Failed to fetch"
      ? `Cannot reach auth backend at ${BASE_URL}. Make sure the backend server is running and CORS allows this frontend origin.`
      : error?.message || fallbackMessage
});

const extractProfileFromAuthResponse = (data) => {
  const user =
    data?.user ||
    data?.payload?.user ||
    data?.payload?.result?.user ||
    data?.payload?.result?.data?.user ||
    data?.data?.user ||
    data?.result?.user ||
    {};

  return {
    fullName:
      user?.fullName ||
      user?.name ||
      user?.userName ||
      user?.username ||
      user?.customerName ||
      data?.fullName ||
      data?.name ||
      data?.payload?.fullName ||
      data?.payload?.name ||
      "",
    email:
      user?.email ||
      user?.emailId ||
      user?.mail ||
      data?.email ||
      data?.payload?.email ||
      "",
    mobileNumber:
      user?.mobileNumber ||
      user?.phone ||
      user?.phoneNumber ||
      user?.mobileNo ||
      data?.mobileNumber ||
      data?.payload?.mobileNumber ||
      "",
    pinCode:
      user?.pinCode ||
      user?.pincode ||
      user?.userPincode ||
      data?.pinCode ||
      data?.pincode ||
      data?.payload?.pinCode ||
      data?.payload?.pincode ||
      "",
    uniqueId:
      user?.uniqueId ||
      user?.augmontUniqueId ||
      user?.providerUserId ||
      data?.uniqueId ||
      data?.payload?.uniqueId ||
      "",
    partnerUserId:
      user?.partnerUserId ||
      data?.partnerUserId ||
      data?.payload?.partnerUserId ||
      ""
  };
};

export const setAuthSession = (token) => {
  if (!token) return;

  localStorage.setItem("token", token);
  localStorage.setItem("isLoggedIn", "true");
};

const buildDisplayName = ({ fullName, email, mobileNumber }) => {
  if (fullName?.trim()) return fullName.trim();

  if (email?.includes("@")) {
    const localPart = email.split("@")[0].replace(/[._-]+/g, " ").trim();

    if (localPart) {
      return localPart.replace(/\b\w/g, (char) => char.toUpperCase());
    }
  }

  if (mobileNumber?.trim()) {
    return `User ${mobileNumber.trim().slice(-4)}`;
  }

  return "User";
};

export const getUserProfile = () => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setUserProfile = ({
  fullName = "",
  email = "",
  mobileNumber = "",
  pinCode = "",
  uniqueId = "",
  partnerUserId = "",
  customerMappedId = "",
  augmontStateId = "",
  augmontCityId = "",
  augmontState = "",
  augmontCity = "",
  augmontAddress = "",
  augmontLandmark = "",
  augmontUserAddressId = "",
  augmontKycStatus = "",
  augmontCreatedAt = ""
} = {}) => {
  const existingProfile = getUserProfile();
  const nextProfile = {
    fullName:
      fullName?.trim() ||
      existingProfile?.fullName ||
      buildDisplayName({ fullName, email, mobileNumber }),
    email: email?.trim() || existingProfile?.email || "",
    mobileNumber: mobileNumber?.trim() || existingProfile?.mobileNumber || "",
    pinCode: pinCode?.trim() || existingProfile?.pinCode || "",
    uniqueId: uniqueId?.trim() || existingProfile?.uniqueId || "",
    partnerUserId:
      String(partnerUserId || "").trim() || existingProfile?.partnerUserId || "",
    customerMappedId:
      String(customerMappedId || "").trim() ||
      existingProfile?.customerMappedId ||
      "",
    augmontStateId:
      String(augmontStateId || "").trim() || existingProfile?.augmontStateId || "",
    augmontCityId:
      String(augmontCityId || "").trim() || existingProfile?.augmontCityId || "",
    augmontState:
      String(augmontState || "").trim() || existingProfile?.augmontState || "",
    augmontCity:
      String(augmontCity || "").trim() || existingProfile?.augmontCity || "",
    augmontAddress:
      String(augmontAddress || "").trim() || existingProfile?.augmontAddress || "",
    augmontLandmark:
      String(augmontLandmark || "").trim() || existingProfile?.augmontLandmark || "",
    augmontUserAddressId:
      String(augmontUserAddressId || "").trim() || existingProfile?.augmontUserAddressId || "",
    augmontKycStatus:
      String(augmontKycStatus || "").trim() ||
      existingProfile?.augmontKycStatus ||
      "",
    augmontCreatedAt:
      String(augmontCreatedAt || "").trim() ||
      existingProfile?.augmontCreatedAt ||
      ""
  };

  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(nextProfile));
  return nextProfile;
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem(USER_PROFILE_KEY);
};

export const getAuthToken = () => localStorage.getItem("token");

export const isAuthenticated = () =>
  localStorage.getItem("isLoggedIn") === "true" && Boolean(getAuthToken());

/* ---------------- SEND OTP (REGISTER / LOGIN) ---------------- */
export const sendOtp = async ({
  mobileNumber,
  email,
  fullName,
  type = "login"
}) => {
  try {
    const endpoint =
      type === "register"
        ? "/auth/register/send-otp"
        : "/auth/login/send-otp";

    const body =
      type === "register"
        ? {
            mobileNumber,
            email,
            emailId: email,
            fullName,
            userName: fullName
          }
        : {
            mobileNumber,
            email
          };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await getJson(res);

    return {
      ok: res.ok,
      ...data
    };
  } catch (error) {
    console.error("Send OTP Error:", error);
    return normalizeError(error, "Unable to send OTP");
  }
};

/* ---------------- VERIFY OTP ---------------- */
export const verifyOtp = async ({
  mobileNumber,
  email,
  otp,
  fullName,
  type = "login"
}) => {
  try {
    const endpoint =
      type === "register"
        ? "/auth/register/verify-otp"
        : "/auth/login/verify-otp";

    const body =
      type === "register"
        ? { fullName, email, mobileNumber, otp }
        : { mobileNumber, email, otp };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await getJson(res);
    const token = data?.token || data?.payload?.token || data?.data?.token;
    const backendProfile = extractProfileFromAuthResponse(data);

    if (res.ok && token) {
      setAuthSession(token);
      setUserProfile({
        fullName: fullName || backendProfile.fullName,
        email: email || backendProfile.email,
        mobileNumber: mobileNumber || backendProfile.mobileNumber,
        pinCode: backendProfile.pinCode,
        uniqueId: backendProfile.uniqueId,
        partnerUserId: backendProfile.partnerUserId
      });
    }

    return {
      ok: res.ok,
      token,
      ...data
    };
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return normalizeError(error, "Unable to verify OTP");
  }
};

/* ---------------- VALIDATE TOKEN ---------------- */
export const validateToken = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      return {
        ok: false,
        valid: false,
        message: "No token found"
      };
    }

    const res = await fetch(`${BASE_URL}/auth/validate-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await getJson(res);
    const backendProfile = extractProfileFromAuthResponse(data);

    if (res.ok) {
      setUserProfile(backendProfile);
    }

    return {
      ok: res.ok,
      valid: res.ok,
      ...data
    };
  } catch (error) {
    console.error("Validate Token Error:", error);
    return normalizeError(error, "Unable to validate token");
  }
};
