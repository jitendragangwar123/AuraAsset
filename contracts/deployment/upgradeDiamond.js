// scripts/replaceFacet.js
const { ethers, network } = require("hardhat")
const netMap = require("../constants/constants.json")

async function main() {
    const diamondAddress = netMap[network.name].Diamond

    // const [deployer] = await ethers.getSigners()

    const provider = ethers.provider
    const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    console.log(deployer.address)

    console.log(deployer)
    console.log("deployer balance", await provider.getBalance(deployer.address)) // 2655601245804756272

    // Deploy new facet
    // const AuraAssetRegistryFacet = await ethers.getContractFactory("AuraAssetRegistryFacet", deployer)
    // const auraAssetRegistryFacet = await AuraAssetRegistryFacet.deploy()
    // await auraAssetRegistryFacet.waitForDeployment()
    // console.log("AuraAssetRegistryFacet deployed to:", auraAssetRegistryFacet.target)

    const AuraAssetInteractionFacet = await ethers.getContractFactory("AuraAssetInteractionFacet", deployer)
    const auraAssetInteractionFacet = await AuraAssetInteractionFacet.deploy()
    await auraAssetInteractionFacet.waitForDeployment()
    console.log("AuraAssetInteractionFacet deployed to:", auraAssetInteractionFacet.target)

    // const AuraAssetViewFacet = await ethers.getContractFactory("AuraAssetViewFacet", deployer)
    // const auraAssetViewFacet = await AuraAssetViewFacet.deploy()
    // await auraAssetViewFacet.waitForDeployment()
    // console.log("AuraAssetViewFacet deployed to:", auraAssetViewFacet.target)

    // Get the diamond contract
    const DiamondCutFacet = await ethers.getContractAt("IDiamondCut", diamondAddress, deployer)

    // Prepare the cut transaction
    const cut = [
        // {
        //     facetAddress: auraAssetRegistryFacet.target,
        //     action: 0, // 0 means Add ,  1 Replace function
        //     functionSelectors: [""]
        // }
        // {
        //     facetAddress: "0x0000000000000000000000000000000000000000",
        //     action: 2, // 0 means Add ,  1 Replace function , 2 for Remove
        //     functionSelectors: [""]
        // },
        // {
        //     facetAddress: auraAssetRegistryFacet.target,
        //     action: 1, // 0 means Add ,  1 Replace function, 2 for Remove
        //     functionSelectors: [
        //     ]
        // },
        {
            facetAddress: auraAssetInteractionFacet.target,
            action: 1, // 0 means Add ,  1 Replace function, 2 for Remove
            functionSelectors: [
                "0x8456cb59", // pause
                "0x3f4ba83a", // unpause
                "0x79aba36d", // invest
                "0x2f44d7a8", // claimAssetTokens
                "0xb8192205", // redeem
                "0xcfdeecee" // updateInvestorAssetInfoOnTransfer
            ]
        }
        // {
        //     facetAddress: auraAssetViewFacet.target,
        //     action: 1, // 0 means Add ,  1 Replace function, 2 for Remove
        //     functionSelectors: []
        // }
    ]

    // Execute the diamond cut
    const tx = await DiamondCutFacet.diamondCut(cut, "0x0000000000000000000000000000000000000000", "0x")
    console.log("Diamond cut transaction sent:", tx.hash)

    const receipt = await tx.wait()
    if (receipt.status) {
        console.log("Diamond cut completed successfully!")
    } else {
        console.error("Diamond cut failed")
    }
}

// Utility function to get function selectors from a contract
function getSelectors(contract) {
    const signatures = Object.keys(contract.interface.functions)
    const selectors = signatures.map((val) => {
        return contract.interface.getSighash(val)
    })
    return selectors
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
