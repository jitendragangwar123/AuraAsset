"use client";
import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { SignProtocolClient, SpMode, EvmChains } from "@ethsign/sp-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
const ownerAddress = privateKeyToAccount(`0x${privateKey}`);

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
  apy: string;
  status: string;
  property_type: string;
};

const PropertyCard: React.FC<PropertyCardProps> = ({
  title,
  desc,
  total_price,
  images,
  location,
  token_name,
  no_of_tokens,
  apy,
  status,
  property_type,
}) => {
  const router = useRouter();
  const { address } = useAccount();
  const [attestationCompleted, setAttestationCompleted] = useState(false);
  const [schemaID, setSchemaID] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSchemaAndAttestation = async (
    assetType: string,
    assetDetails: string[],
    issuer: string,
    totalSupply: number
  ) => {
    try {
      setLoading(true);
      const client = new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains.sepolia,
        account: ownerAddress,
      });
      toast.loading("Wait for Schema Creation........!");
      const schemaResponse = await client.createSchema({
        name: "Aura Asset",
        data: [
          { name: "assetType", type: "string" },
          { name: "assetDetails", type: "string[]" },
          { name: "issuer", type: "address" },
          { name: "totalSupply", type: "uint256" },
        ],
      });

      console.log("Schema created:", schemaResponse.schemaId);
      setSchemaID(schemaResponse.schemaId);
      toast.dismiss();
      toast.success("Schema Created!");
      toast.loading("Wait for Attestation........!");
      if (schemaResponse) {
        const attestationResponse = await client.createAttestation({
          schemaId: schemaResponse.schemaId,
          attestTimestamp: 0,
          revokeTimestamp: 0,
          validUntil: 0,
          dataLocation: 0,
          revoked: false,
          recipients: [issuer],
          data: {
            assetType,
            assetDetails,
            issuer,
            totalSupply,
          },
          indexingValue: issuer.toLowerCase(),
        });
        console.log("Attestation Done: ", attestationResponse.attestationId);
        toast.dismiss();
        toast.success(`Attestation Done with Attestation ID: ${attestationResponse.attestationId}`);
        setAttestationCompleted(true);
        queryAttestations();
      }
    } catch (error) {
      console.error("Error creating schema or attestation:", error);
      toast.error("Error creating schema or attestation!");
    } finally {
      setLoading(false);
    }
  };

  async function makeAttestationRequest(endpoint: string, options: any) {
    const url = `https://testnet-rpc.sign.global/api/${endpoint}`;

    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : null,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    return await response.json();
  }

  async function queryAttestations() {
    const response = await makeAttestationRequest("index/attestations", {
      method: "GET",
      params: {
        mode: "onchain",
        schemaId: schemaID,
        attester: address,
      },
    });
    console.log(response.data.rows);
  }

  const handleViewDetails = (title: string) => {
    if (status !== "sold out") {
      router.push(`/market-place/${encodeURIComponent(title)}`);
    }
  };

  return (
    <div className="max-w-sm rounded-lg mt-5 mb-10 ml-5 font-serif overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl border-2 border-gray-300">
      {images.length > 0 && (
        <img
          className="w-full h-48 object-cover"
          src={images[0]}
          alt="Property"
        />
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
            <span className="text-gray-400">Price</span>
          </div>
          <div>
            <span className="text-gray-400">Total Supply</span>
          </div>
          <div>
            <span className="text-gray-400">APY</span>
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
          <div className="flex items-center">
            <span className="font-bold text-xl">{apy}%</span>
          </div>
        </div>
        <div className="flex justify-between mt-4 space-x-2">
          <button
            onClick={() => handleViewDetails(title)}
            className={`w-1/2 ${
              !attestationCompleted
                ? "bg-gray-400"
                : "bg-blue-500 hover:bg-blue-700"
            } text-white font-bold py-2 px-4 rounded transition duration-300`}
            disabled={!attestationCompleted}
          >
            {attestationCompleted ? "View Details" : "View Details"}
          </button>
          <button
            onClick={() =>
              handleSchemaAndAttestation(
                property_type,
                [
                  title,
                  desc,
                  location.address,
                  location.city,
                  location.state,
                  location.country,
                ],
                "0xB04Ba78b7413C3265ffC1293a4659dEA54Ef0851",
                Number(no_of_tokens)
              )
            }
            className={`w-1/2 ${
              status === "sold out" || attestationCompleted || loading
                ? "bg-gray-400"
                : "bg-blue-500 hover:bg-blue-700"
            } text-white font-bold py-2 px-4 rounded transition duration-300`}
            disabled={status === "sold out" || attestationCompleted || loading}
          >
            {status === "sold out"
              ? "View Attestation"
              : loading
              ? "Processing..."
              : "Make Attestation"}
          </button>
        </div>
      </div>
    </div>
  );
};

const PropertyGallery: React.FC = () => {
  const [selectedRadio, setSelectedRadio] = useState<string>("");
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(
          "https://aura-asset-back-end.vercel.app/get-property-details"
        );
        if (!response.ok) throw new Error("Failed to fetch property data");
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };

    fetchProperties();
  }, []);

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRadio(e.target.value);
  };

  const filteredProperties = properties.filter((property) => {
    return !selectedRadio || property.status === selectedRadio;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-start mt-10 mb-5 space-y-4 md:space-y-0 md:space-x-10">
        <div className="flex flex-row ml-10 gap-4">
          <div className="flex items-center z-0">
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
          <div className="flex items-center z-0">
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
          <PropertyCard key={index} {...property} />
        ))}
      </div>
    </div>
  );
};

export default PropertyGallery;
