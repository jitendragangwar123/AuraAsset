import { ethers } from "ethers"
import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { AuraAssetUSDC, AuraAssetUSDC__factory } from "../typechain"
import AuraAssetUSDCABI from "../constants/abis/AuraAssetUSDCABI.json";

// npx hardhat deployAuraAssetUSDC --admin 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --network sepolia
const deployAuraAssetUSDC = async (arg: any, hre: HardhatRuntimeEnvironment) => {
    const [admin] = await hre.ethers.getSigners()
    console.log("admin", admin.address)
    let AuraAssetUSDCFactory: AuraAssetUSDC__factory = await hre.ethers.getContractFactory("AuraAssetUSDC")
    let auraAssetUSDCContract: AuraAssetUSDC = await AuraAssetUSDCFactory.deploy()
    await auraAssetUSDCContract.initialize("AuraAssetUSDC", "AuraAssetUSDC", admin)
    console.log("AuraAssetUSDC contract is deployed at:", auraAssetUSDCContract.target)
}

const changeAuraAssetUSDCAdmin = async (args: any, hre: HardhatRuntimeEnvironment) => {
    const [admin] = await hre.ethers.getSigners()
    const AuraAssetUSDC = "0x6427E8BAfd676c72313e030Be0198174762b4714"
    console.log("admin", admin.address)
    if (args) {
        // let usdcContract: AuraAssetUSDC = await hre.ethers.getContractAt("AuraAssetUSDC", AuraAssetUSDC)
        let usdcContract = new ethers.Contract(AuraAssetUSDC, AuraAssetUSDCABI, admin);
        const tx = await usdcContract.changeAdmin(args.newadmin)
        await tx.wait(1)
        console.log("AuraAssetUSDC admin has been changed successfully to: ", args.newadmin)
    }
}

// npx hardhat faucetMint --recipient 0xeF2a550530628E9Aed432feF7158b7fd87ba98D4 --network sepolia
const faucetMint = async (args: any, hre: HardhatRuntimeEnvironment) => {
    const [admin] = await hre.ethers.getSigners()
    const AuraAssetUSDC = "0x6427E8BAfd676c72313e030Be0198174762b4714";
    // const AuraAssetUSDC = "0xD42912755319665397FF090fBB63B1a31aE87Cee";
    // const recipient = "0xeF2a550530628E9Aed432feF7158b7fd87ba98D4";
    // const provider = hre.ethers.provider;
    // const admin = new ethers.Wallet("a81f2551674d6d8d94b32af7a843ef545740359e247e9fcdee2ffcd1d9f4a034", provider);
    console.log("admin", admin.address);
    let tx, balance
    try {
        let usdcContract = new ethers.Contract(AuraAssetUSDC, AuraAssetUSDCABI, admin);
        balance = await usdcContract.balanceOf(args.recipient)
        console.log("current admin", await usdcContract.admin())
        console.log(`User: ${args.recipient} \nBalance: ${balance}`)
        tx = await usdcContract.faucetMint(args.recipient)
        await tx.wait(1)
        // // Listen for the 'ValueChanged' event
        // usdcContract.on('AlreadyFaucetMinted', (address, event) => {
        //     console.log(`Value changed to ${address}`, event);
        //     // Additional processing or logging can be done here
        // });

        // // Optionally, handle errors
        // usdcContract.on('Error', (error) => {
        //     console.error('Error event:', error);
        // });
        balance = await usdcContract.balanceOf(args.recipient)
        console.log(`\n----- Mint Successful 🚀🚀🚀------\n`)
        console.log(`User: ${args.recipient} \nBalance: ${balance}`)
    } catch (error: any) {
        // Create an interface object
        const iface = new ethers.Interface(AuraAssetUSDCABI);
        // Decode the error data
        console.log(error.data);
        console.log(error);
        // try {
        //     const decodedError = iface.decodeErrorResult("AlreadyMinted", error.data);
        //     console.log("Decoded Error:", "AlreadyMinted(" + decodedError + ")");
        // } catch (err) {
        //     console.error("Error decoding data:", err);
        // }
    }

}

// npx hardhat mint --recipient 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --amount 50_000000 --network sepolia
const mint = async (args: any, hre: HardhatRuntimeEnvironment) => {
    const [signer] = await hre.ethers.getSigners()
    // const AuraAssetUSDC = "0x46638eEA50581f7cfFeb88D04179bF59198Cbb3f";
    const AuraAssetUSDC = "0x6427E8BAfd676c72313e030Be0198174762b4714";
    let tx, balance
    if (args) {
        // let usdcContract: AuraAssetUSDC = await hre.ethers.getContractAt("AuraAssetUSDC", args.token)
        let usdcContract = new ethers.Contract(AuraAssetUSDC, AuraAssetUSDCABI, signer);
        balance = await usdcContract.balanceOf(args.recipient)
        console.log(`User: ${args.recipient} \nBalance: ${balance}`)
        tx = await usdcContract.mint(args.recipient, args.amount)
        await tx.wait(1)
        balance = await usdcContract.balanceOf(args.recipient)
        console.log(`\n----- Mint Successful 🚀🚀🚀------\n`)
        console.log(`User: ${args.recipient} \nBalance: ${balance}`)
    } else {
        console.log("Invalid Inputs")
    }
}

task("deployAuraAssetUSDC", "Deploy AuraAssetUSDC contract", deployAuraAssetUSDC)
// .addParam(
//     "admin",
//     "The address of the admin"
// );

task("changeAuraAssetUSDCAdmin", "Deploy AuraAssetUSDC contract", changeAuraAssetUSDCAdmin).addParam(
    "newadmin",
    "The address of the new admin"
)

task("faucetMint", "mint USDC Tokens to specific address", faucetMint)
    .addParam("recipient", "The address of the recipient")

task("mint", "mint USDC Tokens to specific address", mint)
    .addParam("recipient", "The address of the recipient")
    .addParam("amount", "amount of tokens to mint")
// .addParam("token", "The address of the AuraAssetUSDC token")
// .addOptionalParam("token", "The address of the token to send")
// .addFlag("gastoken", "use as gasToken for erc20 deposit")
// .addFlag("json", "Output in JSON")
