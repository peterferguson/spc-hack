import { encodeFunctionData } from "viem"
import { walletClient, publicClient } from './permissionless'

// abis --------------------------------------------

const ONIT_FACTORY_ADDRESS = '0x42ab880ea77fc7a09eb6ba0fe82fbc9901c114b6'

const createSafe4337Abi = [
    { "type": "function", "name": "createSafe4337", "inputs": [{ "name": "passkeyPublicKey", "type": "uint256[2]", "internalType": "uint256[2]" }, { "name": "nonce", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "onitAccountAddress", "type": "address", "internalType": "address" }], "stateMutability": "nonpayable" }
]

// formatting calls --------------------------------------------

export const createSafe4337Account = async () => {
    const { request } = await publicClient.simulateContract({
        account: walletClient.account,
        address: ONIT_FACTORY_ADDRESS,
        abi: createSafe4337Abi,
        functionName: 'createSafe4337',
        args: [[1n, 2n], 3n],
    })
    console.log({ request })

    const deployResponse = await walletClient.writeContract(request)
    console.log({ deployResponse })

    return deployResponse
}

const formatFactoryCreateSafe4337Calldata = (x: bigint, y: bigint, nonce: bigint) => {
    const createSafe4337Calldata = encodeFunctionData({ abi: createSafe4337Abi, functionName: "createSafe4337", args: [[x, y], nonce] })
    console.log(createSafe4337Calldata)
    return createSafe4337Calldata
}