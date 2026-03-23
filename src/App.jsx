import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import {
  useLocation,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";

// DASHBOARD
import Dashboard from "./pages/Dashboard";
import Portfolio from "./dashboard/Portfolio";
import LearnMore from "./pages/LearnMore";


// MAIN COMPONENTS
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustSecurity from "./components/TrustSecurity";

import GoldPriceWidget from "./components/GoldPriceWidget";
import MobileApp from "./components/MobileApp";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import CTA from "./components/CTA";

// 🔥 IMPORTANT: ADD THESE IMPORTS
import FeaturesPage from "./pages/Featurespage";
import HowItWorksPage from "./pages/HowItWorksPage";
import WhyPage from "./pages/Whypage";
import FAQPage from "./pages/FAQPage";
import MobilePage from "./pages/MobilePage";

// AUTH
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

// LEGAL
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import RefundPolicy from "./pages/RefundPolicy";
import Disclaimer from "./pages/Disclaimer";

// OTHER
import Products from "./pages/Products";
import GoldPlatformPage from "./pages/GoldPlatformPage";

function HomePage() {
  return (
    <div className="bg-black text-white">

      <Navbar />

      {/* HERO */}
      <Hero />

      

      {/* TRUST */}
      <div className="py-6">
        <TrustSecurity />
      </div>

      {/* GOLD PRICE */}
      <div className="py-6">
        <GoldPriceWidget />
      </div>


      {/* TESTIMONIALS */}
      <div className="py-6">
        <Testimonials />
      </div>

      {/* CTA */}
      <div className="py-10">
        <CTA />
      </div>

      <Footer />

    </div>
  );
}

function App() {
  return (
    <Router>

      <Toaster position="top-right" />

      <ScrollToSection />

      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
<Route path="/orders" element={<OrdersPage />} />
<Route path="/settings" element={<SettingsPage />} />
<Route path="/help" element={<HelpPage />} />
<Route path="/gold-platform" element={<GoldPlatformPage />} />

        {/* DASHBOARD */}
        <Route path="/dashboard/*" element={<Dashboard />}>
          
        </Route>

{/* SEPARATE PAGES */}
<Route path="/portfolio" element={<Portfolio />} />
<Route path="/products" element={<Products />} />
        <Route path="/mobile" element={<MobilePage />} />
        {/* 🔥 NEW PAGES */}
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/why" element={<WhyPage />} />
        <Route path="/faq" element={<FAQPage />} />

        {/* HOME */}
        <Route path="/" element={<HomePage />} />

        {/* OTHER */}
        <Route path="/products" element={<Products />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* LEGAL */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
<Route path="/learn-more" element={<LearnMore />} />
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
