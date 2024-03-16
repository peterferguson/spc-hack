import { encodeFunctionData } from "viem"
import { walletClient, publicClient } from './permissionless'

// abis --------------------------------------------

const NFT_ADDRESS = '0x4A56fD1D63D99978FDb3aC5C152ea122514b6792'

const EXAMPLE_NFT_ABI = [
    { "inputs": [], "name": "exchangeForNft", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "mintCoupon", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "uri", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }]

// nft calls --------------------------------------------

export const getNftUri = async (tokenId: bigint) => {
    const data = await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: EXAMPLE_NFT_ABI,
        functionName: 'uri',
        args: [tokenId],
    })
    console.log({ data })

    return data
}

