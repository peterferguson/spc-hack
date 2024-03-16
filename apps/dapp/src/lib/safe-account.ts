import { encodeFunctionData } from "viem"
import { bundlerClient, paymasterClient, smartAccountClient } from './permissionless'


// abis --------------------------------------------

const createSafe4337Abi = [
    { "type": "function", "name": "createSafe4337", "inputs": [{ "name": "passkeyPublicKey", "type": "uint256[2]", "internalType": "uint256[2]" }, { "name": "nonce", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "onitAccountAddress", "type": "address", "internalType": "address" }], "stateMutability": "nonpayable" }
]

// formatting calls --------------------------------------------

export const createSafe4337Account = async () => {
    const userOperation = await smartAccountClient.prepareUserOperationRequest({
        userOperation: {
            callData: formatFactoryCreateSafe4337Calldata(1n, 2n, 3n),
            callGasLimit: 10000000n,
            verificationGasLimit: 10000000n,
            preVerificationGas: 10000000n,

        }
    })
    console.log({ userOperation })

    // const gas = await bundlerClient.estimateUserOperationGas({
    //     userOperation: userOperation
    // })

    // console.log({ gas })

    const r = await paymasterClient.sponsorUserOperation({
        userOperation: userOperation,
        sponsorshipPolicyId: 'sp_volatile_quasimodo'
        // entryPoint: ENTRYPOINT_ADDRESS_V07
    })
    console.log({ r })

    return r
}

const formatFactoryCreateSafe4337Calldata = (x: bigint, y: bigint, nonce: bigint) => {
    const createSafe4337Calldata = encodeFunctionData({ abi: createSafe4337Abi, functionName: "createSafe4337", args: [[x, y], nonce] })
    console.log(createSafe4337Calldata)
    return createSafe4337Calldata
}