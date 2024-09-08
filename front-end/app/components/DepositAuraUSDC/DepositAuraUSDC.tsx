"use client";
import { useState } from "react";
import { FiCopy } from "react-icons/fi";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import toast from "react-hot-toast";
import {
  AURA_USDC_ADDRESS,
  AURA_USDC_ABI,
  DEPOSIT_USDC_ABI,
  DEPOSIT_USDC_ADDRESS,
} from "../../../constants/index";

const ApproveAndDepositUSDC = () => {
  const [amount, setAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const { isConnected } = useAccount();

  const {
    data: hash,
    isPending: isPendingApprove,
    writeContract: writeApproveContract,
  } = useWriteContract();

  const {
    isLoading: isConfirmingApprove,
    isSuccess: isConfirmedApprove,
    isError: isFailedApprove,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const {
    data: depositHash,
    isPending: isPendingDeposit,
    writeContract: writeDepositContract,
  } = useWriteContract();

  const {
    isLoading: isConfirmingDeposit,
    isSuccess: isConfirmedDeposit,
    isError: isFailedDeposit,
  } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  const ApproveUSDCTokens = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet!");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }

    try {
      setIsApproving(true);
      writeApproveContract({
        address: AURA_USDC_ADDRESS,
        abi: AURA_USDC_ABI,
        functionName: "approve",
        args: [DEPOSIT_USDC_ADDRESS, (Number(amount) * 10 ** 6).toString()],
      });
    } catch (error) {
      toast.error("Tokens Approval failed!");
      setIsApproving(false);
    }
  };

  const DepositUSDCTokens = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet!");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }

    try {
      setIsDepositing(true);
      writeDepositContract({
        address: DEPOSIT_USDC_ADDRESS,
        abi: DEPOSIT_USDC_ABI,
        functionName: "deposit",
        args: [(Number(amount) * 10 ** 6).toString()],
      });
    } catch (error) {
      toast.error("Tokens Deposit failed!");
      setIsDepositing(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="relative max-w-lg w-full mx-auto p-8 mt-20 mb-10 bg-white rounded-xl shadow-md">
        {isConnected ? (
          <>
            <h1 className="text-3xl font-semibold text-center text-blue-500 mb-6">
              Approve And Deposit Aura USDC Token
            </h1>
            <div className="w-full max-w-md mx-auto">
              <div className="flex items-center border border-gray-300 p-2 rounded-lg mb-4 bg-gray-50">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to mint"
                  className="flex-grow text-gray-800 bg-transparent p-2 rounded-lg focus:outline-none"
                />
              </div>

              <button
                onClick={ApproveUSDCTokens}
                className="w-full px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none font-semibold text-lg"
                disabled={
                  isPendingApprove || isConfirmingApprove || isApproving
                }
              >
                {isPendingApprove
                  ? "Approving..."
                  : isConfirmingApprove
                  ? "Waiting for confirmation..."
                  : "Approve Token"}
              </button>

              {isConfirmedApprove && (
                <div className="mt-4 text-center text-green-600">
                  Tokens Approved successfully! Transaction confirmed.
                </div>
              )}

              {isFailedApprove && (
                <div className="mt-4 text-center text-red-600">
                  Tokens Approval failed! Please try again.
                </div>
              )}

              <button
                onClick={DepositUSDCTokens}
                className={`w-full px-4 py-3 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none font-semibold text-lg ${
                  !isConfirmedApprove ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={
                  !isConfirmedApprove ||
                  isPendingDeposit ||
                  isConfirmingDeposit ||
                  isDepositing
                }
              >
                {isPendingDeposit
                  ? "Depositing..."
                  : isConfirmingDeposit
                  ? "Waiting for confirmation..."
                  : "Deposit Token"}
              </button>

              {isConfirmedDeposit && (
                <div className="mt-4 text-center text-green-600">
                  Tokens Deposited successfully! Transaction confirmed.
                </div>
              )}

              {isFailedDeposit && (
                <div className="mt-4 text-center text-red-600">
                  Tokens Deposit failed! Please try again.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-xl font-semibold text-red-600">
            Please Connect Your Wallet To Approve and Deposit The Aura USDC
            Token
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproveAndDepositUSDC;
