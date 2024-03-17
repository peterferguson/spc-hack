import { encodeFunctionData, type Address } from "viem"
import { walletClient, publicClient } from './permissionless'
import { formatExecutionCalldata } from "./safe-account"

/**
 * @dev Example NFT contract functions
 */

// addresses & abis --------------------------------------------
const NFT_ADDRESS = '0x4A56fD1D63D99978FDb3aC5C152ea122514b6792'

const EXAMPLE_NFT_ABI = [
    { "inputs": [], "name": "exchangeForNft", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "mintCoupon", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "uri", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
]

// nft functions --------------------------------------------
export const getNftUri = async (tokenId: bigint) => await publicClient.readContract({
    address: NFT_ADDRESS,
    abi: EXAMPLE_NFT_ABI,
    functionName: 'uri',
    args: [tokenId],
})

export const getBalance = async (address: Address, tokenId: bigint) => {
    if (!address) return 0
    const results = await publicClient.readContract(
        {
            address: NFT_ADDRESS,
            abi: EXAMPLE_NFT_ABI,
            functionName: 'balanceOf',
            args: [address, tokenId],
        }
    )
    return results
}

// nft function formatting --------------------------------------------
/// @dev To be called from the Onit 4337 account, we encode our function call into an executeUserOp payload
export const formatMintCouponToModuleExecutionCalldata = () => formatExecutionCalldata(
    NFT_ADDRESS,
    0n,
    encodeFunctionData({
        abi: EXAMPLE_NFT_ABI,
        functionName: 'mintCoupon',
        args: [],
    }),
    0
)

/// @dev To be called from the Onit 4337 account, we encode our function call into an executeUserOp payload
export const formatExchangeForNftToModuleExecutionCalldata = () => formatExecutionCalldata(
    NFT_ADDRESS,
    0n,
    encodeFunctionData({
        abi: EXAMPLE_NFT_ABI,
        functionName: 'exchangeForNft',
        args: [],
    }),
    0
)



