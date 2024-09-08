import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@openzeppelin/hardhat-upgrades"
import "@typechain/hardhat";
// import "./tasks"
import "solidity-docgen"
import "hardhat-abi-exporter"
import "hardhat-contract-sizer"


import * as dotenv from "dotenv"
dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || ""

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100
      },
      viaIR: true
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      chainId: 31337,
      forking: {
        // url: "https://api-sepolia.arbiscan.io/api",
        url: `${process.env.ETHEREUM_SEPOLIA_RPC_URL}`
      }
    },
    arbSepolia: {
      url: process.env.ARBITRUM_RPC_URL,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    ethSepolia: {
      chainId: 11155111,
      url: process.env.ETHEREUM_SEPOLIA_RPC_URL,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    hederaTestnet: {
      url: process.env.TESTNET_ENDPOINT,
      accounts: [`${process.env.TESTNET_OPERATOR_PRIVATE_KEY}`]
    },
    devnet: {
      url: "",
      chainId: 713715,
      accounts: [PRIVATE_KEY]
    }
  },
  sourcify: {
    enabled: false
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
  abiExporter: {
    path: "./constants/abis",
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 4,
    only: [
      "Deposit",
      "Diamond",
      "OwnershipFacet",
      "DiamondLoupeFacet",
      "AuraAssetInteractionFacet",
      "AuraAssetRegistryFacet",
      "AuraAssetViewFacet",
      "AuraAssetUSDC"
    ]
  },
  sourcify: {
    enabled: false
  },
  etherscan: {
    apiKey: {
      // devnet: 
      // sepolia: ""
    },
    customChains: [
      {
        network: "devnet",
        chainId: 713715,
        urls: {
          apiURL: "",
          browserURL: ""
        }
      },
      {
        network: "sepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/"
        }
      }
    ]
  },
  docgen: {
    outputDir: "./docs",
    pages: "files",
    collapseNewlines: true
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true
    // only: [":ERC20$"]
  },
  gasReporter: {
    currency: "USD",
    enabled: false,
    excludeContracts: [],
    showTimeSpent: true,
    token: "MATIC"
  }
}

export default config