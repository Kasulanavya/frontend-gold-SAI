const BASE_URL =
  import.meta.env.VITE_AUTH_BASE_URL?.trim() ||
  "https://uatauthbckend.karatly.net";

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

export const setAuthSession = (token) => {
  if (!token) return;

  localStorage.setItem("token", token);
  localStorage.setItem("isLoggedIn", "true");
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isLoggedIn");
};

export const getAuthToken = () => localStorage.getItem("token");

export const isAuthenticated = () =>
  localStorage.getItem("isLoggedIn") === "true" && Boolean(getAuthToken());

/* ---------------- SEND OTP (REGISTER / LOGIN) ---------------- */
export const sendOtp = async ({ mobileNumber, email, type = "login" }) => {
  try {
    const endpoint =
      type === "register"
        ? "/auth/register/send-otp"
        : "/auth/login/send-otp";

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mobileNumber,
        email
      })
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

    if (res.ok && token) {
      setAuthSession(token);
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
