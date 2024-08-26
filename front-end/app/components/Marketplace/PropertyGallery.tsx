"use client";
import React, { useEffect, useState } from "react";
import Select, { SingleValue, StylesConfig } from "react-select";
import { FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";
import Link from "next/link";


type OptionType = {
 value: string;
 label: string;
};


type Location = {
 address: string;
 city: string;
 state: string;
 country: string;
};


type PropertyCardProps = {
 title: string;
 desc: string;
 total_price: string;
 images: string[]; 
 location: Location;
 token_name: string;
 no_of_tokens: string;
 status: string; 
};


const customStyles: StylesConfig<OptionType, false> = {
 control: (provided) => ({
   ...provided,
   backgroundColor: "#f0f0f0",
   borderColor: "#ccc",
   "&:hover": {
     borderColor: "#888",
   },
 }),
 menu: (provided) => ({
   ...provided,
   backgroundColor: "#fff",
   borderRadius: "4px",
   boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
 }),
 option: (provided, state) => ({
   ...provided,
   backgroundColor: state.isSelected
     ? "#007bff"
     : state.isFocused
     ? "#e2e6ea"
     : "#fff",
   color: state.isSelected ? "#fff" : "#333",
   "&:hover": {
     backgroundColor: "#e2e6ea",
   },
 }),
 singleValue: (provided) => ({
   ...provided,
   color: "#333",
 }),
};


const PropertyCard: React.FC<PropertyCardProps> = ({
 title,
 desc,
 total_price,
 images,
 location,
 token_name,
 no_of_tokens,
 status,
}) => {
 return (
   <div className="max-w-sm rounded-lg mt-5 mb-10 ml-5 font-serif overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl border-2 border-gray-300">
     {images.length > 0 && (
       <img className="w-full h-48 object-cover" src={images[0]} alt="Property" />
     )}
     <div className="p-2">
       <div className="flex items-center mb-2">
         <span className="font-bold text-2xl">{title}</span>
       </div>
       <div className="flex items-center mb-4 text-gray-400">
         <FaMapMarkerAlt className="mr-2" />
         <span>{`${location.address}, ${location.city}, ${location.state}, ${location.country}`}</span>
       </div>
       <p className="text-gray-500 text-base mb-4">{desc}</p>
       <div className="flex items-center justify-between mb-2">
         <div>
           <span className="text-gray-400">Token Price</span>
         </div>
         <div>
           <span className="text-gray-400">Total Supply</span>
         </div>
       </div>
       <div className="flex items-center justify-between mb-2">
         <div className="flex items-center justify-between">
           <FaDollarSign className="text-green-600" />
           <span className="font-bold text-xl">{total_price}</span>
         </div>
         <div className="flex items-center">
           <span className="font-bold text-xl">{no_of_tokens}</span>
         </div>
       </div>


       <Link href="/purchase-assets" legacyBehavior>
         <button
           className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
           disabled={status === "sold out"}
         >
           {status === "sold out" ? "Sold Out" : "View Details"}
         </button>
       </Link>
     </div>
   </div>
 );
};


const PropertyGallery: React.FC = () => {
 const [selectedOption, setSelectedOption] =
   useState<SingleValue<OptionType>>(null);
 const [selectedRadio, setSelectedRadio] = useState<string>("");
 const [properties, setProperties] = useState<PropertyCardProps[]>([]);


 useEffect(() => {
   const fetchProperties = async () => {
     try {
       const response = await fetch(
         "https://flexi-mart-back-end.vercel.app/getPropertyDatails"
       );
       const data = await response.json();
       setProperties(data);
     } catch (error) {
       console.error("Failed to fetch properties:", error);
     }
   };


   fetchProperties();
 }, []);


 const handleDropdownChange = (option: SingleValue<OptionType>) => {
   setSelectedOption(option);
 };


 const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   setSelectedRadio(e.target.value);
 };


 const filteredProperties = properties.filter((property) => {
   return (
     (!selectedOption || property.token_name === selectedOption.value) &&
     (!selectedRadio || property.status === selectedRadio)
   );
 });


 const options: OptionType[] = [
   { value: "Residentials", label: "Residentials" },
   { value: "Villas", label: "Villas" },
   { value: "Offices", label: "Offices" },
   { value: "Commercial", label: "Commercial" },
   { value: "Others", label: "Others" },
 ];


 return (
   <div>
     <div className="flex flex-col md:flex-row justify-start mt-10 mb-5 space-y-4 md:space-y-0 md:space-x-10">
       <div className="w-full ml-10 md:w-1/6">
         <Select
           id="dropdown"
           value={selectedOption}
           onChange={handleDropdownChange}
           options={options}
           styles={customStyles}
           className="w-full"
         />
       </div>
       <div className="flex flex-row gap-4">
         <div className="flex items-center">
           <input
             type="radio"
             id="available"
             name="radioGroup"
             value="available"
             checked={selectedRadio === "available"}
             onChange={handleRadioChange}
             className="mr-2 accent-blue-500"
           />
           <label
             htmlFor="available"
             className="text-gray-700 text-lg font-serif dark:text-gray-300"
           >
             Available
           </label>
         </div>
         <div className="flex items-center">
           <input
             type="radio"
             id="sold-out"
             name="radioGroup"
             value="sold out"
             checked={selectedRadio === "sold out"}
             onChange={handleRadioChange}
             className="mr-2 accent-blue-500"
           />
           <label
             htmlFor="sold-out"
             className="text-gray-700 text-lg font-serif dark:text-gray-300"
           >
             Sold Out
           </label>
         </div>
       </div>
     </div>
     <div className="flex flex-wrap gap-2 p-4">
       {filteredProperties.map((property, index) => (
         <PropertyCard
           key={index}
           title={property.title}
           desc={property.desc}
           total_price={property.total_price}
           images={property.images}
           location={property.location}
           token_name={property.token_name}
           no_of_tokens={property.no_of_tokens}
           status={property.status}
         />
       ))}
     </div>
   </div>
 );
};


export default PropertyGallery;