import { network } from "hardhat";
import { updateContractsJson } from "../utils/updateContracts";

const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 }

async function deploy() {
    let tx, txr
    const accounts = await ethers.getSigners()
    const networkName = network.name
    console.log("networkName: ", networkName)
    const chainId = network.config.chainId
    console.log("chainId: ", chainId);
    const startBlock = await ethers.provider.getBlock("latest")
    console.log("startBlock: ", startBlock.number)

    const owner = accounts[0].address
    console.log("owner:", owner)

    // Deploy AuraAssetRegistry contract
    const auraAssetUSDCFactory = await hre.ethers.getContractFactory("AuraAssetUSDC")
    const auraAssetUSDCContract = await upgrades.deployProxy(auraAssetUSDCFactory, ["AuraUSDC", "AuraUSDC", owner])
    await auraAssetUSDCContract.waitForDeployment()
    console.log("AuraAssetUSDC is deployed to:", auraAssetUSDCContract.target)
    // const AuraAssetUSDCAddress = auraAssetUSDCContract.target
    // const AuraAssetUSDCAddress = "0xe30f4f7f7099668A8145B1025b69dd1Cda4493Bd"

    // // Deploy Deposit contract
    const DepositFactory = await hre.ethers.getContractFactory("Deposit")
    const depositContract = await upgrades.deployProxy(DepositFactory, [auraAssetUSDCContract.target, owner])
    await depositContract.waitForDeployment()
    console.log(`Deposit is deployed to:`, depositContract.target)

    // deploy DiamondCutFacet
    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet")
    const diamondCutFacet = await DiamondCutFacet.deploy()
    await diamondCutFacet.waitForDeployment()
    console.log("DiamondCutFacet deployed:", diamondCutFacet.target)

    const DiamondLoupeFacet = await ethers.getContractFactory("DiamondLoupeFacet")
    const diamondLoupeFacet = await DiamondLoupeFacet.deploy()
    await diamondLoupeFacet.waitForDeployment()
    console.log("DiamondLoupeFacet deployed:", diamondLoupeFacet.target)

    const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet")
    const ownershipFacet = await OwnershipFacet.deploy()
    await ownershipFacet.waitForDeployment()
    console.log("OwnershipFacet deployed:", ownershipFacet.target)

    const AuraAssetInteractionFacet = await ethers.getContractFactory("AuraAssetInteractionFacet")
    const auraAssetInteractionFacet = await AuraAssetInteractionFacet.deploy()
    await auraAssetInteractionFacet.waitForDeployment()
    console.log("AuraAssetInteractionFacet deployed:", auraAssetInteractionFacet.target)

    const AuraAssetRegistryFacet = await ethers.getContractFactory("AuraAssetRegistryFacet")
    const auraAssetRegistryFacet = await AuraAssetRegistryFacet.deploy()
    await auraAssetRegistryFacet.waitForDeployment()
    console.log("AuraAssetRegistryFacet deployed:", auraAssetRegistryFacet.target)

    const AuraAssetViewFacet = await ethers.getContractFactory("AuraAssetViewFacet")
    const auraAssetViewFacet = await AuraAssetViewFacet.deploy()
    await auraAssetViewFacet.waitForDeployment()
    console.log("AuraAssetViewFacet deployed:", auraAssetViewFacet.target)

    const DiamondInit = await ethers.getContractFactory("DiamondInit")
    const diamondInit = await DiamondInit.deploy()
    await diamondInit.waitForDeployment()
    console.log("DiamondInit deployed:", diamondInit.target)

    const Diamond = await ethers.getContractFactory("Diamond")
    const diamond = await Diamond.deploy(owner, diamondCutFacet.target)
    await diamond.waitForDeployment()
    console.log("Diamond deployed:", diamond.target)

    const FacetNames = ["DiamondLoupeFacet", "OwnershipFacet", "AuraAssetInteractionFacet", "AuraAssetRegistryFacet", "AuraAssetViewFacet"]

    const diamondLoupeSelectors = ["0xcdffacc6", "0x52ef6b2c", "0xadfca15e", "0x7a0ed627", "0x01ffc9a7"]
    const ownershipSelectors = ["0x8da5cb5b", "0xf2fde38b"]

    const auraAssetRegistrySelectors = [
        "0x0ec2e821", // setDepositContract
        "0xa48c0c4b", // setKYCStatus
        "0xd1b30f9c", // setSPVDocument
        "0x1e4e0091", // setRoleAdmin
        "0x2f2ff15d", // grantRole
        "0xd547741f", // revokeRole
        "0x36568abe", // renounceRole
        "0x5c231aab", // addAssetType
        "0x5d4d3c1c", // removeAssetType
        "0xc138d643", // addAsset
        "0xf14f58f1" // removeAsset
    ]

    const auraAssetInteractionSelectors = [
        "0x8456cb59", // pause
        "0x3f4ba83a", // unpause
        "0x79aba36d", // invest
        "0x2f44d7a8", // claimAssetTokens
        "0xb8192205", // redeem
        "0xcfdeecee" // updateInvestorAssetInfoOnTransfer
    ]

    const auraAssetViewSelectors = [
        "0x6f475e7f", // validateTransfer
        "0x3cb48bee", // isAccountKYCVerified
        "0x2264856b", // hasAssignedRole
        "0xb187bd26", // isPaused
        "0x37097bf6", // assetIdCount
        "0x9cdde7e0", // assetTypeCount
        "0x8d5802e2", // getAssetOwner
        "0x8c50fdd3", // getInvestorAssetInfo
        "0x97b8354f", // getAssetInvestors
        "0xb3e444a7", // getAssetById
        "0x9a4b8c0d", // getAssetType
        "0xb36733b6", // getAllAssetTypes
        "0x25feaf21", // getRentalYieldById
        "0x252f2d30", // getIRRById
        "0x9796300e", // getAnnualAppreciationById
        "0xd235b75f", // getSPVDocument
        "0x914dcff6" // checkForTargetFundsFulfilled
    ]
    const cut: any = []

    // 0xc354bd6e
    cut.push({
        facetAddress: diamondLoupeFacet.target,
        action: FacetCutAction.Add,
        functionSelectors: diamondLoupeSelectors
    })

    cut.push({
        facetAddress: ownershipFacet.target,
        action: FacetCutAction.Add,
        functionSelectors: ownershipSelectors
    })

    cut.push({
        facetAddress: auraAssetInteractionFacet.target,
        action: FacetCutAction.Add,
        functionSelectors: auraAssetInteractionSelectors
    })

    cut.push({
        facetAddress: auraAssetRegistryFacet.target,
        action: FacetCutAction.Add,
        functionSelectors: auraAssetRegistrySelectors
    })

    cut.push({
        facetAddress: auraAssetViewFacet.target,
        action: FacetCutAction.Add,
        functionSelectors: auraAssetViewSelectors
    })

    const diamondCut = await hre.ethers.getContractAt("IDiamondCut", diamond.target)
    console.log("here");

    let functionCall = diamondInit.interface.encodeFunctionData("init", [depositContract.target])
    console.log(depositContract.target)
    console.log("here");

    tx = await diamondCut.diamondCut(cut, diamondInit.target, functionCall)
    console.log("here");

    console.log("Diamond cut tx: ", tx.hash)
    txr = await tx.wait()
    if (!txr.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    console.log("Completed diamond cut")

    const deposit = await depositContract.attach(depositContract.target)
    const depositRes = await deposit.setDiamond(diamond.target)
    let depositResWait = await depositRes.wait()
    if (!depositResWait.status) {
        throw Error(`failed to add Diamond contract in Deposit `)
    }

    let contracts = [
        { name: "AuraAssetUSDC", address:  auraAssetUSDCContract.target },
        { name: "Deposit", address: depositContract.target },
        { name: "Diamond", address: diamond.target },
        { name: "DiamondInit", address: diamondInit.target },
        { name: "DiamondLoupeFacet", address: diamondLoupeFacet.target },
        { name: "DiamondCutFacet", address: diamondCutFacet.target },
        { name: "OwnershipFacet", address: ownershipFacet.target },
        { name: "AuraAssetInteractionFacet", address: auraAssetInteractionFacet.target },
        { name: "AuraAssetRegistryFacet", address: auraAssetRegistryFacet.target },
        { name: "AuraAssetViewFacet", address: auraAssetViewFacet.target },
        { name: "StartBlock", address: startBlock.number }
    ]

    updateContractsJson(contracts)
    console.table(contracts)
    console.log("Deployment finished!")
}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
