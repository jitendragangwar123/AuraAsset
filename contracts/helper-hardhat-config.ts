export interface networkConfigItem {
    chainId: number
    goldskySlug: string
    deployer: string
    usdc?: string
    usdcAdmin?: string
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    hardhat: {
        chainId: 31337,
        goldskySlug: "hardhat",
        deployer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        usdc: "0xe30f4f7f7099668A8145B1025b69dd1Cda4493Bd",
        usdcAdmin: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    },
    localhost: {
        chainId: 31337,
        goldskySlug: "localhost",
        deployer: "0x2dC727b15203992B65D7ADbc0108781f1Cb1F9F3",
        usdc: "0xe30f4f7f7099668A8145B1025b69dd1Cda4493Bd",
        usdcAdmin: "0x2dC727b15203992B65D7ADbc0108781f1Cb1F9F3",
    },
    ethSepolia: {
        chainId: 11155111,
        goldskySlug: "",
        deployer: "0x2dC727b15203992B65D7ADbc0108781f1Cb1F9F3",
        usdc: "0xe30f4f7f7099668A8145B1025b69dd1Cda4493Bd",
        usdcAdmin: "0x2dC727b15203992B65D7ADbc0108781f1Cb1F9F3",
    },
    ethMainnet: {
        chainId: 1,
        goldskySlug: "",
        deployer: "0x2dC727b15203992B65D7ADbc0108781f1Cb1F9F3",
        usdc: "",
        usdcAdmin: "0x2dC727b15203992B65D7ADbc0108781f1Cb1F9F3",
    }
}

export const forkedChain = ["localhost"]
export const testNetworkChains = ["ethSepolia"]
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6
