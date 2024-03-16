import { createBundlerClient, createSmartAccountClient } from "permissionless"
import { baseSepolia } from "viem/chains"
import { createPublicClient, createWalletClient, http } from "viem"
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { privateKeyToSimpleSmartAccount, signerToSafeSmartAccount } from "permissionless/accounts";
import { privateKeyToAccount } from "viem/accounts";

// ! Dont do this in prod
const pimlicoApiKey = import.meta.env.PUBLIC_PIMLICO_API_KEY
const privateKey = import.meta.env.PUBLIC_PRIVATE_KEY

const pimlicoTransport = (version: 'v1' | 'v2') => http(`https://api.pimlico.io/${version}/${baseSepolia.id}/rpc?apikey=${pimlicoApiKey}`)

export const ENTRYPOINT_ADDRESS_V07 = '0x0000000071727De22E5E9d8BAf0edAc6f37da032';
export const ENTRYPOINT_ADDRESS_V06 = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

// create clients --------------------------------------------

export const publicClient = createPublicClient({
    transport: http(baseSepolia.rpcUrls.default.http[0])
});

export const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: http(baseSepolia.rpcUrls.default.http[0]),
    account: privateKeyToAccount(privateKey)
});

export const bundlerClient = createBundlerClient({
    chain: baseSepolia,
    transport: pimlicoTransport('v2'),
    entryPoint: ENTRYPOINT_ADDRESS_V07
})

export const paymasterClient = createPimlicoPaymasterClient({
    transport: pimlicoTransport('v2'),
    entryPoint: ENTRYPOINT_ADDRESS_V06
});

// create account & account client --------------------------------------------

export const simpleAccount = await privateKeyToSimpleSmartAccount(publicClient, {
    privateKey: privateKey,
    factoryAddress: "0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232",
    entryPoint: ENTRYPOINT_ADDRESS_V07
});

export const safeAccount = await signerToSafeSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT_ADDRESS_V06,
    signer: privateKeyToAccount(privateKey),
    saltNonce: 0n, // optional
    safeVersion: "1.4.1",
    //address: "0x...", // optional, only if you are using an already created account
})

export const smartAccountClient = createSmartAccountClient({
    account: simpleAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: baseSepolia,
    bundlerTransport: pimlicoTransport('v2'),
});

export const safeAccountClient = createSmartAccountClient({
    account: safeAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V06,
    chain: baseSepolia,
    bundlerTransport: pimlicoTransport('v2'),
});


