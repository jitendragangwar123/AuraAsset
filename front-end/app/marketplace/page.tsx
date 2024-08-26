import PropertyGallery from "../components/Marketplace/PropertyGallery";
import PropertyBanner from "../components/Marketplace/PropertyBanner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import React from "react";


export default async function Page() {
  return (
    <div className="">
      <Header/>
        <PropertyBanner/>
        <PropertyGallery />
      <Footer/>
    </div> 
  );
}