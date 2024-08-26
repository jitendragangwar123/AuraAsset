import ListingProject from "../components/ProjectListing/ListNewProject";
import Footer from "../components/Footer";
import Header from "../components/Header";
import React from "react";


export default async function Page() {
  return (
    <div className="">
      <Header/>
        <ListingProject />
      <Footer/>
    </div> 
  );
}