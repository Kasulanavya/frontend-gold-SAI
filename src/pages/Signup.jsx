import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, MapPinned, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import RegistrationForm from "../components/RegistrationForm";
import { sendOtp, setUserProfile, verifyOtp } from "../api/authApi";

const initialFormValues = {
  userName: "",
  mobileNumber: "",
  emailId: "",
  uniqueId: "",
  stateName: "",
  cityName: "",
  userPincode: "",
  dateOfBirth: "",
  otp: ""
};

const mobileRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pincodeRegex = /^\d{6}$/;

const isValidDate = (value) => {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
};

const buildValidationErrors = (values, otpSent = false) => {
  const errors = {};

  if (!values.userName.trim()) {
    errors.userName = "Full name is required";
  }

  if (!mobileRegex.test(values.mobileNumber.trim())) {
    errors.mobileNumber = "Enter a valid 10-digit mobile number";
  }

  if (!emailRegex.test(values.emailId.trim())) {
    errors.emailId = "Enter a valid email address";
  }

  if (!values.uniqueId.trim()) {
    errors.uniqueId = "Unique id is required";
  }

  if (!values.stateName.trim()) {
    errors.stateName = "Enter a state name";
  }

  if (!values.cityName.trim()) {
    errors.cityName = "Enter a city name";
  }

  if (!pincodeRegex.test(values.userPincode.trim())) {
    errors.userPincode = "Enter a valid 6-digit pincode";
  }

  if (!isValidDate(values.dateOfBirth)) {
    errors.dateOfBirth = "Select a valid date of birth";
  }

  if (otpSent && !values.otp.trim()) {
    errors.otp = "Enter the OTP";
  }

  return errors;
};

const sanitizeValue = (name, value) => {
  if (name === "mobileNumber" || name === "userPincode" || name === "otp") {
    return value.replace(/\D/g, "");
  }

  return value;
};

export default function Signup() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const goldCoins = useMemo(() => Array.from({ length: 8 }), []);

  const handleChange = (name, value) => {
    const nextValue = sanitizeValue(name, value);

    setFormValues((current) => ({
      ...current,
      [name]: nextValue
    }));

    setErrors((current) => {
      if (!current[name]) return current;
      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });

    if (name === "otp" && submitError) {
      setSubmitError("");
    }
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    const validationErrors = buildValidationErrors(formValues, false);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please complete the required registration details");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const response = await sendOtp({
      email: formValues.emailId.trim(),
      mobileNumber: formValues.mobileNumber.trim(),
      fullName: formValues.userName.trim(),
      type: "register"
    });

    setSubmitting(false);

    if (!response?.ok) {
      const message = response?.message || "Failed to send OTP";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    setOtpSent(true);
    toast.success(response?.message || "OTP sent successfully");
  };

  const handleVerifyAndCreate = async (event) => {
    event.preventDefault();
    const validationErrors = buildValidationErrors(formValues, true);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const verifyResponse = await verifyOtp({
      fullName: formValues.userName.trim(),
      email: formValues.emailId.trim(),
      mobileNumber: formValues.mobileNumber.trim(),
      otp: formValues.otp.trim(),
      type: "register"
    });

    if (!verifyResponse?.ok || !verifyResponse?.token) {
      const message = verifyResponse?.message || "OTP verification failed";
      setSubmitting(false);
      setSubmitError(message);
      toast.error(message);
      return;
    }

    setSubmitting(false);

    setUserProfile({
      fullName: formValues.userName.trim(),
      email: formValues.emailId.trim(),
      mobileNumber: formValues.mobileNumber.trim(),
      pinCode: formValues.userPincode.trim(),
      uniqueId: formValues.uniqueId.trim(),
      augmontState: formValues.stateName.trim(),
      augmontCity: formValues.cityName.trim()
    });

    setSuccess(true);
    toast.success("Registration completed successfully");
  };

  const handleSubmit = otpSent ? handleVerifyAndCreate : handleSendOtp;

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(250,204,21,0.18), transparent 28%), linear-gradient(135deg, #1f1602 0%, #050505 48%, #140f02 100%)"
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-8 md:py-10">
        <div className="grid flex-1 gap-8 overflow-hidden rounded-[2rem] border border-yellow-400/10 bg-black/40 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative overflow-hidden px-6 py-10 md:px-10 md:py-14">
            <style>{`
              @keyframes fallCoin3D {
                0% { top: -40px; opacity: 0.7; transform: scale(1) rotate(0deg); }
                40% { opacity: 1; transform: scale(1.1) rotate(20deg); }
                70% { opacity: 1; transform: scale(1) rotate(-10deg); }
                100% { top: 90%; opacity: 0.2; transform: scale(0.9) rotate(0deg); }
              }
              .animate-fallCoin3D {
                animation: fallCoin3D 2.8s linear infinite;
              }
            `}</style>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.16),transparent_32%),radial-gradient(circle_at_80%_50%,rgba(251,191,36,0.12),transparent_28%)]" />

            {goldCoins.map((_, index) => (
              <div
                key={index}
                className="absolute animate-fallCoin3D"
                style={{
                  left: `${8 + index * 10}%`,
                  top: `-${30 + index * 10}px`,
                  animationDelay: `${index * 0.45}s`,
                  width: "44px",
                  height: "44px",
                  zIndex: 1
                }}
              >
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <ellipse cx="22" cy="22" rx="20" ry="16" fill="#FFD54A" stroke="#FACC15" strokeWidth="2" />
                  <text x="22" y="27" textAnchor="middle" fontSize="15" fill="#5b4100" fontWeight="bold">
                    G
                  </text>
                </svg>
              </div>
            ))}

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 text-black shadow-[0_12px_30px_rgba(251,191,36,0.25)]">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-yellow-300/80">
                    Common Gold Registration
                  </p>
                  <h1 className="max-w-md text-4xl font-bold leading-tight text-white">
                    One shared onboarding flow for every gold user.
                  </h1>
                  <p className="max-w-lg text-sm leading-7 text-yellow-100/80 md:text-base">
                    App registration is handled only by the auth backend. We still collect
                    state and city names here so the later goldplatform onboarding flow can
                    reuse them, but provider linking now happens only after app login.
                  </p>
                </div>
              </div>

              <div className="mt-10 space-y-4 rounded-[1.75rem] border border-yellow-300/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <MapPinned className="mt-0.5 h-5 w-5 text-yellow-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">Backend-driven location data</p>
                    <p className="mt-1 text-xs leading-6 text-yellow-100/70">
                      State and city names are stored with the app profile so the wrapper
                      onboarding screens can use them later without re-entering everything.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-yellow-300/10 pt-4 text-xs text-yellow-100/70">
                  <div className="flex items-center justify-between gap-4">
                    <span>App auth</span>
                    <span>{otpSent ? "OTP sent" : "Pending"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Selected state</span>
                    <span>{formValues.stateName || "Not entered"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Selected city</span>
                    <span>{formValues.cityName || "Not entered"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Registration status</span>
                    <span>{success ? "Completed" : otpSent ? "OTP pending" : "Details pending"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-5 py-8 md:px-8 md:py-12">
            <div className="w-full max-w-3xl rounded-[2rem] border border-yellow-300/10 bg-black/60 p-6 shadow-2xl md:p-8">
              {success ? (
                <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="mt-6 text-3xl font-bold text-white">Registration successful</h2>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-yellow-100/80">
                    Your gold account has been created through the shared wrapper flow. You can
                    continue with the existing login and OTP journey using your registered mobile
                    number and email.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="mt-8 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
                  >
                    Go to dashboard
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white">Register</h2>
                    <p className="text-sm leading-6 text-yellow-100/80">
                      {otpSent
                        ? "Verify the OTP to complete app registration. Provider onboarding now happens later through wrapper APIs after login."
                        : "Fill your details once. This step creates only the app account; gold wrapper onboarding starts after login."}
                    </p>
                  </div>

                  {submitError ? (
                    <div className="mt-5 rounded-2xl border border-rose-400/40 bg-rose-950/40 p-4 text-sm text-rose-100">
                      <p>{submitError}</p>
                    </div>
                  ) : null}

                  <RegistrationForm
                    formValues={formValues}
                    errors={errors}
                    submitting={submitting}
                    otpSent={otpSent}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onResetOtp={() => {
                      setOtpSent(false);
                      setSubmitError("");
                      handleChange("otp", "");
                    }}
                  />

                  <p className="mt-6 text-center text-sm text-yellow-200">
                    Already have an account? <Link to="/login" className="font-semibold text-yellow-300">Login</Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
