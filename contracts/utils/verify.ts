import { run } from "hardhat"

const verify = async (contractAddresses: string, args: any[], contractName: string = "") => {
    console.log("Verifying Contract...")
    try {
        let verifyObj
        if (contractName) {
            verifyObj = {
                address: contractAddresses,
                constructorArguments: args,
                contract: contractName
            }
        } else {
            verifyObj = {
                address: contractAddresses,
                constructorArguments: args
            }
        }
        await run("verify:verify", verifyObj)
    } catch (err: any) {
        if (err.message.toLowerCase().includes("already verified")) {
            console.log("Contract Already Verfied!")
        } else {
            console.log(err)
        }
    }
}

export default verify
