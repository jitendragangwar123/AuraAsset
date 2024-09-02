import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import networkAddressMap from "../constants/constants.json"
import * as helpers from "@nomicfoundation/hardhat-network-helpers";

// hh upgrade --name "AuraAssetRegistry" --network sepolia
const upgrade = async (args: any, hre: HardhatRuntimeEnvironment) => {
    let deployer; 
    [deployer] = await hre.ethers.getSigners()
    const chainName = hre.network.name;
    // // For testing on forked environment
    if (chainName == "localhost") {
        await helpers.mine()
        const provider = hre.ethers.provider
        const private_key: any = process.env.PRIVATE_KEY;
        deployer = new hre.ethers.Wallet(private_key, provider)
        console.log(deployer.address)
    }
    if (args) {
        let getBlock: any = await hre.ethers.provider.getBlock("latest")
        console.log(`Block number: `, getBlock.number)
        const contractFactory: any = await hre.ethers.getContractFactory(args.name, deployer)
        const networkAddresses: any = networkAddressMap;
        const contractName: any = networkAddresses[chainName][args.name];
        const contract: any = await hre.upgrades.upgradeProxy(contractName, contractFactory)
        console.log(`Contract has been upgraded with tx hash:`, contract.deployTransaction.hash)
    } else {
        console.log("Invalid Inputs")
    }
}


task("upgrade", "Upgrade the contracts", upgrade)
    .addParam("name", "The contract name")
// .addParam("address", "The proxy contract address")

