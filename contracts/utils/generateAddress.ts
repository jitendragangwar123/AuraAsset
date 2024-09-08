import { ethers } from "ethers"
import * as crypto from "crypto"

export const generateAddress = async () => {
    for (let i = 0; i < 5; i++) {
        console.log("Generating Address...")
        try {
            let id = crypto.randomBytes(32).toString("hex")
            // let privateKey = "0x" + "ID_GENERATED"
            let privateKey = `0x${id}`
            console.log("SAVE BUT DO NOT SHARE THIS:", privateKey)
            let wallet = new ethers.Wallet(privateKey)
            console.log("Address: " + wallet.address)
        } catch (error: any) {
            console.error(error)
            process.exit(1)
        }
    }
}

generateAddress()
