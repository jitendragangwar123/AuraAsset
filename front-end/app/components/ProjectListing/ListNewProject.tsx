"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

type Location = {
  address: string;
  city: string;
  state: string;
  country: string;
};

type PropertyData = {
  title: string;
  desc: string;
  total_price: string;
  images: File[];
  location: Location;
  token_name: string;
  no_of_tokens: string;
  apy: string;
  property_type: string;
};

const ListingProject: React.FC = () => {
  const { isConnected } = useAccount();
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [totalPrice, setTotalPrice] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [location, setLocation] = useState<Location>({
    address: "",
    city: "",
    state: "",
    country: "",
  });
  const [tokenName, setTokenName] = useState<string>("");
  const [noOfTokens, setNoOfTokens] = useState<string>("");
  const [apy, setApy] = useState<string>(""); // State for APY
  const [propertyType, setPropertyType] = useState<string>(""); // State for Property Type

  const router = useRouter();

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length !== 1) {
      toast.error("You must upload exactly one image.");
      return;
    }

    setImages(files);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("desc", desc);
    formData.append("total_price", totalPrice);
    formData.append("location", JSON.stringify(location));
    formData.append("token_name", tokenName);
    formData.append("no_of_tokens", noOfTokens);
    formData.append("apy", apy); // Append APY to FormData
    formData.append("property_type", propertyType); // Append Property Type to FormData

    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await fetch("https://aura-asset-back-end.vercel.app/list-property", {
        method: "POST",
        body: formData,
      });

      if (response.status === 200) {
        toast.success("Property listed successfully");
        router.push("/marketplace");
      } else {
        toast.error("Error listing property");
        console.error("Error listing property:", await response.json());
      }
    } catch (error) {
      toast.error("Error listing property");
      console.error("Error listing property:", error);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-200">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/img1.jpg")',
          filter: "blur(4px)",
        }}
      ></div>
      <div className="relative max-w-2xl w-full mx-auto p-8 mt-[90px] mb-[20px] bg-gray-200 bg-opacity-90 rounded-lg shadow-lg">
        {isConnected ? (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
              List a New Property
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full h-[40px] bg-gray-100 text-black rounded-md px-3 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Token Price
                  </label>
                  <input
                    type="number"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    className="mt-1 block w-full h-[40px] bg-gray-100 text-black rounded-md px-3 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Token Name
                  </label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="mt-1 block w-full h-[40px] bg-gray-100 text-black rounded-md px-3 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Tokens
                  </label>
                  <input
                    type="number"
                    value={noOfTokens}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value));
                      setNoOfTokens(value.toString());
                    }}
                    className="mt-1 block w-full h-[40px] bg-gray-100 text-black rounded-md px-3 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    min={1}
                  />
                </div>

                {/* APY Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    APY
                  </label>
                  <input
                    type="number"
                    value={apy}
                    onChange={(e) => setApy(e.target.value)}
                    className="mt-1 block w-full h-[40px] bg-gray-100 text-black rounded-md px-3 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Property Type Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Property Type
                  </label>
                  <input
                    type="text"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="mt-1 block w-full h-[40px] bg-gray-100 text-black rounded-md px-3 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="mt-1 block w-full h-[100px] bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Images
                </label>
                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(image)}
                      alt={`preview ${index}`}
                      className="w-full h-auto rounded-lg"
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    value={location.address}
                    onChange={(e) =>
                      setLocation({ ...location, address: e.target.value })
                    }
                    className="mt-1 block w-full h-[40px] bg-gray-100 text-black rounded-md px-3 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    value={location.city}
                    onChange={(e) =>
                      setLocation({ ...location, city: e.target.value })
                    }
                    className="mt-1 block w-full h-[40px] bg-gray-100 text-black rounded-md px-3 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    value={location.state}
                    onChange={(e) =>
                      setLocation({ ...location, state: e.target.value })
                    }
                    className="mt-1 block w-full h-[40px] bg-gray-100 text-black rounded-md px-3 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    value={location.country}
                    onChange={(e) =>
                      setLocation({ ...location, country: e.target.value })
                    }
                    className="mt-1 block w-full h-[40px] bg-gray-100 text-black rounded-md px-3 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="inline-block px-6 py-2 mt-4 text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  List Property
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xl text-gray-700 mb-4">
              Please connect your wallet to list a property.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingProject;
