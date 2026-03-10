import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustSecurity from "./components/TrustSecurity";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import GoldPriceWidget from "./components/GoldPriceWidget";
import MobileApp from "./components/MobileApp";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import Whysabbpegold from "./components/Whysabbpegold";

function App() {
  return (
    <div className="bg-black text-white">

      <Navbar />

      <section id="home">
        <Hero />
      </section>

      <TrustSecurity />

      <section id="how-it-works">
        <HowItWorks />
      </section>

      <section id="features">
        <Features />
      </section>

      <section id="gold-prices">
        <GoldPriceWidget />
      </section>

      <section id="why-sabpegold">
        <Whysabbpegold />
      </section>

      <section id="mobile-app">
        <MobileApp />
      </section>

      <section id="testimonials">
        <Testimonials />
      </section>

      <section id="faq">
        <FAQ />
      </section>

      <section id="contact">
        <Footer />
      </section>

    </div>
  );
}

export default App;