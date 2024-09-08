import { network } from "hardhat"
import * as helpers from "@nomicfoundation/hardhat-network-helpers"
import { Deposit, AuraAssetUSDC } from "../typechain"
import DepositABI  from "../constants/abis/Deposit.json"
import AuraAssetUSDCABI  from "../constants/abis/AuraAssetUSDC.json"
import netMap from "../constants/networkMapping.json"
import { forkedChain, networkConfig } from "../helper-hardhat-config"

const main = async () => {
    let tx, txr, deployer, rajeeb
    const networkName = network.name as keyof typeof netMap

    if (forkedChain.includes(networkName)) {
        await helpers.mine()
        const provider = ethers.provider
        deployer = new ethers.Wallet(process.env.PRIVATE_KEY!.toString(), provider)
    } else {
        [deployer] = await ethers.getSigners()
    }

    const deposit: Deposit = new ethers.Contract(netMap[networkName].Deposit, DepositABI, deployer)
    const usdc: AuraAssetUSDC = new ethers.Contract(netMap[networkName].AuraAssetUSDC, AuraAssetUSDCABI, deployer)

    tx = await usdc.balanceOf("0xe30f4f7f7099668A8145B1025b69dd1Cda4493Bd");
    console.log("balance", tx);

    // tx = await usdc.connect(rajeeb).approve(netMap[networkName].Deposit, "1000000000000000000");
    // await tx.wait();
    // tx = await deposit.connect(rajeeb).deposit("1000000000000000000");
    // await tx.wait()
    // tx = await deposit.connect(rajeeb).balances(rajeeb.address);
    // console.log(tx)
    // tx = await usdc.balanceOf(rajeeb.address);
    // console.log("balance", tx);
}

main()
    .then(() => process.exit(0))
    .catch((error: any) => {
        console.error(error)
        process.exit(1)
    })
