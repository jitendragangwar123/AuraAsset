import fs from "fs"
import { network } from "hardhat"

const networkMappingPath = "constants/networkMapping.json"

export const updateContractsJson = async (contractList: any) => {
    // const dir = 'deployments'
    let contractAddresses = {}
    const chainName = network.name
    try {
        if (fs.existsSync(networkMappingPath)) {
            contractAddresses = JSON.parse(fs.readFileSync(networkMappingPath, "utf-8"))
        }

        for (const cntrct of contractList) {
            // const contractInstance = await ethers.getContractAt(cntrct.contract, cntrct.address)
            let keys = Object.keys(contractAddresses)
            if (!keys.includes(chainName)) {
                contractAddresses[chainName] = {}
            }
            contractAddresses[chainName][cntrct.name] = cntrct.address
        }

        fs.writeFileSync(networkMappingPath, JSON.stringify(contractAddresses))
    } catch (error: any) {
        console.log(`Error: ${error.message}`)
        throw error
    }
    console.log(`Network Mapping JSON Updated!`)
}
