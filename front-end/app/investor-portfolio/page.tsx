import InvestorPortfolio from "../components/InvestorPortfolio/InvestorPortfolio";
import Footer from "../components/Footer";
import Header from "../components/Header";
import React from "react";

export default async function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: 'url("/background.gif")',
          filter: "blur(6px)",
        }}
      ></div>
      <Header />
      <InvestorPortfolio />
      <div className="relative z-0">
        <Footer />
      </div>
    </div>
  );
}