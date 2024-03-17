import type { APIRoute } from "astro";
import { Credential, db, sql } from "astro:db";
import { getXandY, importPublicKeyAsCryptoKey } from "helpers";
import { z } from "zod";

const deploySchema = z.object({
	username: z.string().optional(),
	publicKey: z.string().optional(),
});

/**
 * TODO: @jamesmccomish please add a description for this route handler ... why we need to deploy from a relay instead of
 * TODO: using init code
 */

export const POST: APIRoute = async (ctx) => {
	try {
		const { username, publicKey } = deploySchema.parse(
			await ctx.request.json(),
		);

		if (!username && !publicKey)
			return new Response("Invalid input", { status: 400 });

		const [credential] =
			(await db
				.select()
				.from(Credential)
				.where(
					username
						? sql`${Credential.username}= ${username}`
						: sql`${Credential.publicKey}= ${publicKey}`,
				)
				.limit(1)) ?? [];

		if (!credential) return new Response("Account not found", { status: 404 });

		const publicKeyBuffer = Buffer.from(credential.publicKey, "base64url");

		const pk = await importPublicKeyAsCryptoKey(
			new Uint8Array(publicKeyBuffer),
		);

		if (!pk) return new Response("Invalid public key", { status: 400 });

		const { x, y } = await getXandY(pk);

		const { txHash, result: deployAddress } = await relaySafeDeploy({
			publicKey: [BigInt(x), BigInt(y)],
		});

		return new Response(JSON.stringify({ address: deployAddress, txHash }), {
			status: 204,
		});
	} catch (e) {
		console.log("error", e);

		return new Response((e as Error).message, { status: 500 });
	}
};

const relaySafeDeploy = async ({
	publicKey,
}: { publicKey: [bigint, bigint] }) => {
	const { baseSepolia } = await import("viem/chains");
	const { createPublicClient, createWalletClient, http } = await import("viem");
	const { privateKeyToAccount } = await import("viem/accounts");

	const publicClient = createPublicClient({
		transport: http(baseSepolia.rpcUrls.default.http[0]),
	});

	const walletClient = createWalletClient({
		chain: baseSepolia,
		transport: http(baseSepolia.rpcUrls.default.http[0]),
		account: privateKeyToAccount(import.meta.env.PRIVATE_KEY),
	});

	const { request, result } = await publicClient.simulateContract({
		account: walletClient.account,
		address: ONIT_FACTORY_ADDRESS,
		abi: createSafe4337Abi,
		functionName: "createSafe4337",
		args: [publicKey, 0n],
	});

	const txHash = await walletClient.writeContract(request);

	return { txHash, result };
};

// abis --------------------------------------------

const ONIT_FACTORY_ADDRESS =
	"0x42ab880ea77fc7a09eb6ba0fe82fbc9901c114b6" as const;

const createSafe4337Abi = [
	{
		type: "function",
		name: "createSafe4337",
		inputs: [
			{
				name: "passkeyPublicKey",
				type: "uint256[2]",
				internalType: "uint256[2]",
			},
			{ name: "nonce", type: "uint256", internalType: "uint256" },
		],
		outputs: [
			{ name: "onitAccountAddress", type: "address", internalType: "address" },
		],
		stateMutability: "nonpayable",
	},
] as const;
