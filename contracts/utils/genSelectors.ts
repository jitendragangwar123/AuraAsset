import ethers from "ethers"
import path from "path"

const args = process.argv.slice(2)

if (args.length != 1) {
    console.log(`please supply the correct parameters: facetName`)
    process.exit(1)
}

export const printSelectors = async (contractName: any, artifactFolderPath: string = "../out") => {
    const contractFilePath = path.join(artifactFolderPath, `${contractName}.sol`, `${contractName}.json`)
    const contractArtifact = require(contractFilePath)
    const abi = contractArtifact.abi
    const bytecode = contractArtifact.bytecode
    const target = new ethers.ContractFactory(abi, bytecode)
    const signatures = abi
        .filter((item: any) => item.type === "function")
        .map((item: any) => {
            const inputs = item.inputs.map((input: any) => input.type).join(",")
            return `${item.name}(${inputs})`
        })
    const getSelectors = getFunctionSelectors(signatures)
    console.log(getSelectors)

    // Format the selectors as Solidity bytes4[] array
    const solidityBytes4Array = getSelectors.map((selector: any) => `0x${selector.slice(2)}`).join(", ")

    console.log(`[${solidityBytes4Array}]`)
}

// Function to get function selectors
function getFunctionSelectors(functionSignatures: any) {
    return functionSignatures.map((signature: any) => ethers.id(signature).substring(0, 10))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
printSelectors(args[0])
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
