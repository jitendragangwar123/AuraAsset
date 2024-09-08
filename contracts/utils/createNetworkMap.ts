import fs from "fs"
import { ethers, network } from "hardhat"

const networkMappingPath = "constants/networkMapping.json"

export const updateNetworkMap = (contractList: any) => {
    let contractAddresses
    if (!fs.existsSync("constants")) {
        fs.mkdirSync("constants")
    }
    if (fs.existsSync(networkMappingPath)) {
        contractAddresses = JSON.parse(fs.readFileSync(networkMappingPath, "utf-8"))
    } else {
        contractAddresses = {}
    }
    const chainId = network.config.chainId?.toString() || "31337"
    for (const cntrct of contractList) {
        // const contractInstance = await ethers.getContractAt(cntrct.contract, cntrct.address)
        let keys = Object.keys(contractAddresses)
        if (!keys.includes(chainId)) {
            contractAddresses[chainId] = {}
        }
        contractAddresses[chainId][cntrct.name] = cntrct.address
    }
    fs.writeFileSync(networkMappingPath, JSON.stringify(contractAddresses))
}
