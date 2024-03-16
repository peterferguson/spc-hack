// Import the required modules.
import { createBundlerClient } from "permissionless"
import { sepolia } from "viem/chains"
import { http } from "viem"

// ! Dont do this in prod
const pimlicoApiKey = import.meta.env.PUBLIC_PIMLICO_API_KEY

// Create the required clients.
export const bundlerClient = createBundlerClient({
    chain: sepolia,
    transport: http(`https://api.pimlico.io/v1/sepolia/rpc?apikey=${pimlicoApiKey}`) // Use any bundler url
})

// Consume bundler, paymaster, and smart account actions!
export const userOperationReceipt = await bundlerClient.getUserOperationReceipt({
    hash: "0x5faea6a3af76292c2b23468bbea96ef63fb31360848be195748437f0a79106c8"
})