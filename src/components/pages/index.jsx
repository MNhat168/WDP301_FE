import React from "react";
import Header from "../layout/header";
import HeroSection from "../HeroSection/HeroSection";
import JobCategories from "../JobCategories/JobCategories";
import FeaturedJobs from "../FeaturedJobs/FeaturedJobs";
import HowItWorks from "../HowItWorks/HowItWorks";
import CompanyShowcase from "../CompanyShowcase/CompanyShowcase";
import Statistics from "../Statistics/Statistics";
import CTASection from "../CTASection/CTASection";
import Footer from "../Footer/Footer";
import "../../App.css";

function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <HeroSection />
        <JobCategories />
        <FeaturedJobs />
        <HowItWorks />
        <Statistics />
        <CompanyShowcase />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default Index;
