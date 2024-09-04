"use client";
import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import GithubIcon from "./svg/GithubIcon";
import UpRightArrowIcon from "./svg/UpRightArrowIcon";
import Features from "./components/Features/Features";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: 'url("/background.gif")',
          filter: "blur(6px)",
        }}
      ></div>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen py-10 mt-6 font-serif bg-gradient-to-b from-blue-100 to-blue-300 dark:from-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center justify-center w-full max-w-6xl gap-16 mb-5 text-center lg:flex-row lg:text-left">
          <div className="flex flex-col w-full gap-6 lg:w-1/2">
            <h1 className="text-3xl font-bold text-gray-800 transition duration-700 ease-in-out transform md:text-4xl lg:text-5xl dark:text-gray-200 animate-fadeIn hover:scale-105">
              Welcome to
            </h1>
            <h2 className="text-5xl font-extrabold text-blue-600 transition duration-700 ease-in-out transform md:text-6xl lg:text-7xl dark:text-blue-400 animate-bounce hover:scale-105">
              Aura Asset
            </h2>
            <p className="text-lg text-gray-200 transition duration-700 ease-in-out transform md:text-3xl lg:text-2xl dark:text-gray-200 animate-fadeInDelay hover:scale-105">
              Empowering Investments Through Tokenization of Real-World Assets
            </p>
            <div className="flex gap-4 z-0">
              <Link
                href="https://github.com/jitendragangwar123/AuraAsset"
                legacyBehavior
              >
                <a className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-white transition duration-700 ease-in-out bg-blue-600 border-2 border-blue-600 rounded-md shadow-md font-medium hover:bg-blue-600 hover:shadow-lg active:bg-blue-800 active:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <span>Welcome to Aura Asset</span>
                  <GithubIcon />
                </a>
              </Link>
              <Link href="/market-place" legacyBehavior>
                <a className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-black transition duration-700 ease-in-out bg-white border-2 border-blue-600 rounded-md shadow-md font-medium hover:bg-blue-600 hover:shadow-lg active:bg-white active:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <span>Start Exploring</span>
                  <UpRightArrowIcon />
                </a>
              </Link>
            </div>
          </div>
          <div className="flex justify-center w-full lg:w-1/2 lg:justify-end">
            <Image
              className="relative transition duration-700 ease-in-out transform hover:scale-105 dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
              src="/dashboard.png"
              alt="hero page"
              width={600}
              height={150}
              priority
            />
          </div>
        </div>

        <div className="grid gap-4 mb-2 text-center md:grid-cols-2 lg:grid-cols-4 lg:text-left lg:max-w-5xl z-0">
          <a
            href="/market-place"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="flex items-center justify-center gap-2 mb-3 text-2xl font-semibold">
              Marketplace <UpRightArrowIcon />
            </h2>
            <p className="opacity-75 text-sm-2">
              By leveraging the power of blockchain technology, our platform
              enables the fractional ownership of properties, making real estate
              investment more accessible and liquid than ever before.
            </p>
          </a>
          <a
            href="/project-listing"
            className="group rounded-lg border border-transparent px-3 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="flex items-center justify-center gap-2 mb-3 text-2xl font-semibold">
              Project Owner <UpRightArrowIcon />
            </h2>
            <p className="opacity-75 text-sm-2">
              As a project owner, our platform offers you a unique opportunity
              to list and tokenize your real-estate assets, unlocking new
              revenue streams and expanding your investor base.
            </p>
          </a>
          <a
            href="/investor-portfolio"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="flex items-center justify-center gap-2 mb-3 text-2xl font-semibold">
              Investor <UpRightArrowIcon />
            </h2>
            <p className="opacity-75 text-sm-2">
              Investors can easily buy, sell, and trade property tokens,
              enjoying unparalleled transparency, robust security, and enhanced
              efficiency throughout the entire process.
            </p>
          </a>
          <a
            href="/investor-portfolio"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="flex items-center justify-center gap-2 mb-3 text-2xl font-semibold">
              Portfolio <UpRightArrowIcon />
            </h2>
            <p className="opacity-75 text-sm-2">
              Investors can effortlessly manage and track their real estate
              investments. Simply tap the portfolio icon on the top bar to
              quickly access the current value of your holdings.
            </p>
          </a>
        </div>
      </div>
      <div className="relative z-0">
        <Features />
        <Footer />
      </div>
    </main>
  );
}
