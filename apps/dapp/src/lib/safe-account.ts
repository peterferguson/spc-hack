import { encodeFunctionData, type Address, type Hex } from "viem"
import { walletClient, publicClient } from './permissionless'

// abis --------------------------------------------

const ONIT_FACTORY_ADDRESS = '0x42ab880ea77fc7a09eb6ba0fe82fbc9901c114b6'

const ONIT_FACTORY_ABI = [
    { "type": "function", "name": "createSafe4337", "inputs": [{ "name": "passkeyPublicKey", "type": "uint256[2]", "internalType": "uint256[2]" }, { "name": "nonce", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "onitAccountAddress", "type": "address", "internalType": "address" }], "stateMutability": "nonpayable" }
]

const ONIT_SAFE_4337_ABI = [
    { "type": "function", "name": "executeUserOp", "inputs": [{ "name": "to", "type": "address", "internalType": "address" }, { "name": "value", "type": "uint256", "internalType": "uint256" }, { "name": "data", "type": "bytes", "internalType": "bytes" }, { "name": "operation", "type": "uint8", "internalType": "uint8" }], "outputs": [], "stateMutability": "nonpayable" }
]

// safe factory calls --------------------------------------------

export const createSafe4337Account = async () => {
    const { request } = await publicClient.simulateContract({
        account: walletClient.account,
        address: ONIT_FACTORY_ADDRESS,
        abi: ONIT_FACTORY_ABI,
        functionName: 'createSafe4337',
        args: [[1n, 2n], 3n],
    })
    console.log({ request })

    const deployResponse = await walletClient.writeContract(request)
    console.log({ deployResponse })

    return deployResponse
}

// 4337 module calls --------------------------------------------

/**
 * @dev Build payload which the entryPoint will call on the sender Onit 4337 account
 */
export const formatExecutionCalldata = (to: Address, value: bigint, data: Hex, operation: number) => encodeFunctionData({
    abi: ONIT_SAFE_4337_ABI,
    functionName: 'executeUserOp',
    args: [to, value, data, operation],
})
