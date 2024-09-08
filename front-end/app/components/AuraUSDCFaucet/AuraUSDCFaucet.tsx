"use client";
import { useState } from "react";
import { FiCopy } from "react-icons/fi";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import toast from "react-hot-toast";
import { AURA_USDC_ADDRESS, AURA_USDC_ABI } from "../../../constants/index";

const MintAuraUSDC = () => {
  const [addressUSDC, setAddressUSDC] = useState(
    "0xe30f4f7f7099668A8145B1025b69dd1Cda4493Bd"
  );
  const [copied, setCopied] = useState(false);
  const { isConnected, address } = useAccount();

  const {
    data: hash,
    isPending: isMinting,
    writeContract,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isFailed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(addressUSDC);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success(
      "Aura Asset USDC token address copied, Please import this token in your wallet!"
    );
  };

  const mintToken = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet!");
      return;
    }

    try {
      const tx = await writeContract({
        address: AURA_USDC_ADDRESS,
        abi: AURA_USDC_ABI,
        functionName: "faucetMint",
        args: [address],
      });
    } catch (error) {
      toast.error("Minting failed!");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="relative max-w-lg w-full mx-auto p-8 mt-20 mb-10 bg-white rounded-xl shadow-md">
        {isConnected ? (
          <>
            <h1 className="text-3xl font-semibold text-center text-blue-500 mb-6">
              Mint Aura Asset USDC Token
            </h1>
            <div className="w-full max-w-md mx-auto">
              <div className="flex items-center border border-gray-300 p-2 rounded-lg mb-4 bg-gray-50">
                <input
                  type="text"
                  value={addressUSDC}
                  readOnly
                  className="flex-grow text-gray-800 bg-transparent p-2 rounded-lg focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="ml-2 px-3 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none flex items-center"
                >
                  {copied ? "Copied!" : <FiCopy className="text-white" />}
                </button>
              </div>

              <button
                onClick={mintToken}
                className="w-full px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none font-semibold text-lg"
                disabled={isMinting || isConfirming}
              >
                {isMinting
                  ? "Minting..."
                  : isConfirming
                  ? "Waiting for confirmation..."
                  : "Mint Token"}
              </button>

              {isConfirmed && (
                <div className="mt-4 text-center text-green-600">
                  Minting successful! Transaction confirmed.
                </div>
              )}

              {isFailed && (
                <div className="mt-4 text-center text-red-600">
                  Minting failed! Please try again.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-xl font-semibold text-red-600">
            Please Connect Your Wallet To Mint The Aura Asset USDC Token
          </div>
        )}
      </div>
    </div>
  );
};

export default MintAuraUSDC;
