import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Services from "./components/Services";
import Pricing from "./components/Pricing";
import BookingForm from "./components/BookingForm";
import WhyBreathEasy from "./components/WhyBreathEasy";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <HowItWorks />
      <Services />
      <Pricing />
      <BookingForm />
      <WhyBreathEasy />
      <FAQ />
      <Footer />
      <ChatWidget />
    </main>
  );
}
