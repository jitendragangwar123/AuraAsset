import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@openzeppelin/hardhat-upgrades"
import "@typechain/hardhat";
import "./tasks"
import "solidity-docgen"


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
        url: "https://api-sepolia.arbiscan.io/api"
      }
    },
    sepolia: {
      url: process.env.ARBITRUM_RPC_URL,
      accounts: [`${process.env.PRIVATE_KEY}`,`${process.env.PRIVATE_KEY_AURA}`]
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
  }
}

export default config