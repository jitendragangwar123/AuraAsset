"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FaMapMarkerAlt } from "react-icons/fa";
import Loader from "../Loder";
import { useAccount } from "wagmi";

type Location = {
  address: string;
  city: string;
  state: string;
  country: string;
};

type PropertyCardProps = {
  _id: string;
  title: string;
  desc: string;
  total_price: string;
  images: string[];
  location: Location;
  token_name: string;
  no_of_tokens: string;
  apy: string;
  status: string;
  earnedYield: number;
  value: number;
  holdingTokens: number;
  userAddress: string;
  userData: UserData[];
};

type InvestmentBanner = {
  earnedYield: number;
  value: number;
};

type UserData = {
  userAddress: string;
  value: number;
  earnedYield: number;
  holdingTokens: number;
};

const PropertyCard: React.FC<
  Omit<PropertyCardProps, "userData"> & UserData
> = ({
  _id,
  title,
  desc,
  total_price,
  images,
  location,
  token_name,
  no_of_tokens,
  apy,
  status,
  earnedYield,
  value,
  holdingTokens,
  userAddress,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClaimYield = async () => {
    try {
      setIsLoading(true);
      toast.loading("Wait for Transactions...");
      const storedTransactionsData = await fetch(
        "https://aura-asset-back-end.vercel.app/storeTransactionsData",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            txnHash: "txnHash",
            investorAddress: userAddress,
            tokenAmount: holdingTokens,
            diamAmount: earnedYield.toString(),
            action: "Yield Claimed",
            url: `https://sepolia.etherscan.io/tx/${"txnHash"}`,
          }),
        }
      );

      await storedTransactionsData.json();
      toast.dismiss();
      toast.success("Yield claimed successfully!");
      setIsLoading(false);
    } catch (error) {
      console.error("Error in handleClaimYield:", error);
      toast.dismiss();
      toast.error("Error claiming yield.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg rounded-lg ml-20 mb-10 overflow-hidden shadow-lg border border-gray-300 transform transition duration-300 hover:scale-105 hover:shadow-xl">
      <img
        className="w-full h-48 object-cover"
        src={images[0]}
        alt="Property"
      />
      <div className="p-4">
        <div className="flex items-center mb-2">
          <span className="font-bold text-2xl">{title}</span>
        </div>
        <div className="flex items-center text-gray-200">
          <FaMapMarkerAlt className="mr-2" />
          <span>{`${location.address}, ${location.city}, ${location.state}, ${location.country}`}</span>
        </div>
        <hr className="my-1 border-gray-300" />
        <div className="flex flex-col justify-between mb-2">
          <div className="flex items-center justify-between text-gray-300 mb-1">
            <span>Value:</span>
            <span className="text-gray-300 text-lg">${value}</span>
          </div>
          <div className="flex items-center justify-between text-gray-300 mb-1">
            <span>Earned Yield:</span>
            <span className="text-gray-300 text-lg">${earnedYield}</span>
          </div>
          <div className="flex items-center justify-between text-gray-300 mb-1">
            <span>Yield Percentage:</span>
            <span className="text-gray-300 text-lg">{apy}%</span>
          </div>
          <div className="flex items-center justify-between text-gray-300 mb-1">
            <span>Holding Tokens:</span>
            <span className="text-gray-300 text-lg">{holdingTokens}</span>
          </div>
          <hr className="my-1 border-gray-300" />
        </div>

        <button
          className="w-full bg-blue-500 text-white font-bold py-2 px-2 rounded hover:bg-blue-700 transition duration-300"
          onClick={handleClaimYield}
          disabled={isLoading}
        >
          {isLoading ? "Claiming..." : "Claim Yield"}
        </button>
      </div>
    </div>
  );
};

const PortfolioOverview: React.FC = () => {
  const [aggregatedData, setAggregatedData] = useState<InvestmentBanner | null>(
    null
  );
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected, address } = useAccount();

  const fetchPropertiesByAddress = async () => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet!");
        return;
      }
      const response = await fetch(
        `https://aura-asset-back-end.vercel.app/get-properties-by-user-address?userAddress=${address}`
      );
      if (!response.ok) {
        toast.error("Investor don't have any asset");
        return;
      }
      const data = await response.json();
      const transformedData = data.map((property: PropertyCardProps) => {
        const userData = property.userData.find(
          (user) => user.userAddress === address
        );
        return {
          ...property,
          value: userData?.value || 0,
          earnedYield: userData?.earnedYield || 0,
          holdingTokens: userData?.holdingTokens || 0,
        };
      });
      console.log("Transformed data:", transformedData);
      setProperties(transformedData);
      const aggregated = transformedData.reduce(
        (
          acc: { earnedYield: number; value: number },
          property: { earnedYield: number; value: number }
        ) => {
          acc.earnedYield += property.earnedYield;
          acc.value += property.value;
          return acc;
        },
        { value: 0, earnedYield: 0 } as InvestmentBanner
      );
      setAggregatedData(aggregated);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Investor don't have any asset");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertiesByAddress();
  }, [isConnected, address]);

  return (
    <div className="flex min-h-screen flex-col font-serif items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300 dark:from-gray-800 dark:to-gray-900 mt-14 pt-8">
      {!isConnected || isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="flex justify-start w-full max-w-6xl mt-4 z-0">
            <h1 className="text-3xl md:text-4xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200">
              Overview
            </h1>
          </div>
          {aggregatedData && (
            <div className="flex flex-col lg:flex-row gap-14 border border-white  w-full max-w-6xl bg-white dark:bg-black shadow-lg rounded-lg mt-4 pl-14 pr-14 mb-10 z-0">
              <div className="flex w-full flex-col pt-10 gap-10">
                <div className="flex flex-col w-full lg:w-2/3">
                  <h1 className="text-4xl md:text-4xl lg:text-xl font-bold text-gray-800 dark:text-gray-200 animate-fadeIn transition duration-700 ease-in-out transform hover:scale-105">
                    Value
                  </h1>
                  <h2 className="text-6xl md:text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400 animate-fadeIn transition duration-700 ease-in-out transform hover:scale-105">
                    ${aggregatedData.value}
                  </h2>
                </div>

                <div className="flex flex-col md:flex-row gap-16">
                  <div>
                    <h2 className="text-4xl md:text-4xl lg:text-xl font-bold text-gray-800 dark:text-gray-200 animate-fadeIn transition duration-700 ease-in-out transform hover:scale-105">
                      Yield Earned
                    </h2>
                    <h2 className="text-6xl md:text-4xl lg:text-5xl font-bold text-green-600 dark:text-green-400 animate-fadeIn transition duration-700 ease-in-out transform hover:scale-105">
                      ${aggregatedData.earnedYield}
                    </h2>
                  </div>
                  <div>
                    <h2 className="text-4xl md:text-4xl lg:text-xl font-bold text-gray-800 dark:text-gray-200 animate-fadeIn transition duration-700 ease-in-out transform hover:scale-105">
                      Total Invested
                    </h2>
                    <h2 className="text-6xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-200 animate-fadeIn transition duration-700 ease-in-out transform hover:scale-105">
                      ${aggregatedData.value - aggregatedData.earnedYield}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex w-full lg:w-1/2 lg:justify-end">
                <Image
                  className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] transition duration-700 ease-in-out transform hover:scale-105"
                  src="/homepage.png"
                  alt="Portfolio Image"
                  width={400}
                  height={200}
                  priority
                />
              </div>
            </div>
          )}

          <div className="flex justify-start w-full max-w-6xl mr-25 mt-4 z-0">
            <h1 className="text-3xl md:text-4xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200">
              My Assets
            </h1>
          </div>
          <div className="flex justify-start w-full mt-5 ml-20">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                _id={property._id}
                title={property.title}
                desc={property.desc}
                total_price={property.total_price}
                images={property.images}
                location={property.location}
                token_name={property.token_name}
                no_of_tokens={property.no_of_tokens}
                apy={property.apy}
                status={property.status}
                earnedYield={property.earnedYield}
                value={property.value}
                holdingTokens={property.holdingTokens}
                userAddress={property.userAddress}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PortfolioOverview;
