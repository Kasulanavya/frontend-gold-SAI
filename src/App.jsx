import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import {
  useLocation,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Portfolio from "./dashboard/Portfolio"; // ✅ ADD
import Profile from "./dashboard/Profile"; // ✅ ADD

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustSecurity from "./components/TrustSecurity";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import DashboardPreview from "./components/DashboardPreview";
import GoldPriceWidget from "./components/GoldPriceWidget";
import MobileApp from "./components/MobileApp";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import Whysabbpegold from "./components/Whysabbpegold";
import CTA from "./components/CTA";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import RefundPolicy from "./pages/RefundPolicy";
import Disclaimer from "./pages/Disclaimer";
import Products from "./pages/Products";

function HomePage() {
  return (
    <div className="bg-black text-white">
      <Navbar />

      <section id="home"><Hero /></section>
      <section id="your-dashboard"><DashboardPreview /></section>

      <TrustSecurity />

      <section id="how-it-works"><HowItWorks /></section>
      <section id="features"><Features /></section>
      <section id="gold-prices"><GoldPriceWidget /></section>
      <section id="why-sabpegold"><Whysabbpegold /></section>
      <section id="mobile-app"><MobileApp /></section>
      <section id="testimonials"><Testimonials /></section>
      <section id="faq"><FAQ /></section>

      <CTA />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>

      {/* 🔥 GLOBAL TOASTER */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />

      <ScrollToSection />

      <Routes>

        {/* ✅ DASHBOARD (FIXED STRUCTURE) */}
        <Route path="/dashboard/*" element={<Dashboard />}>
          <Route index element={<Portfolio />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ✅ HOME */}
        <Route path="/" element={<HomePage />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* LEGAL */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />

        {/* OTHER */}
        <Route path="/products" element={<Products />} />

      </Routes>
    </Router>
  );
}

function ScrollToSection() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  return null;
}

export default App;