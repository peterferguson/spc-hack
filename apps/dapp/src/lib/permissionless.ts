import { ENTRYPOINT_ADDRESS_V07, createBundlerClient } from "permissionless";
import { pimlicoPaymasterActions } from "permissionless/actions/pimlico";
import { createClient, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

// ! Dont do this in prod
const pimlicoApiKey = import.meta.env.PUBLIC_PIMLICO_API_KEY;

const pimlicoTransport = (version: "v1" | "v2") =>
	http(
		`https://api.pimlico.io/${version}/${baseSepolia.id}/rpc?apikey=${pimlicoApiKey}`,
	);

// create clients --------------------------------------------

export const publicClient = createPublicClient({
	transport: http(baseSepolia.rpcUrls.default.http[0]),
});

export const paymasterClient = createClient({
	chain: baseSepolia,
	transport: pimlicoTransport("v2"),
}).extend(pimlicoPaymasterActions(ENTRYPOINT_ADDRESS_V07));

export const bundlerClient = createBundlerClient({
	chain: baseSepolia,
	transport: pimlicoTransport("v2"),
	entryPoint: ENTRYPOINT_ADDRESS_V07,
});
