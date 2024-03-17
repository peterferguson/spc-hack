import { Button } from "@/components/ui/button";
import { formatMintCouponToModuleExecutionCalldata } from "@/lib/example-nft";
import { bundlerClient, publicClient } from "@/lib/permissionless";
import { getPayeeOrigin, getPaymentOrigin } from "@/lib/utils";
import {
	ENTRYPOINT_ADDRESS_V07,
	getAccountNonce,
	getUserOperationHash,
	type UserOperation,
} from "permissionless";
import {
	fallbackToIframeCredentialCreation,
	getAvailableCredentials,
	getPaymentDetails,
	payWithSPC,
} from "spc-lib";
import type { Address } from "viem";
import { baseSepolia } from "viem/chains";

export function CreatePaymentButton() {
	return (
		<Button
			id="create-payment-button"
			onClick={async (e) => {
				e.preventDefault();

				// - allow only a single credential for now
				const [credential] =
					(await getAvailableCredentials(getPaymentOrigin())) ?? [];

				const address = credential?.address as Address | undefined;
				if (!address) {
					return fallbackToIframeCredentialCreation();
				}

				const { userOperation, userOperationHash } =
					await getMintNftUserOperation(address);

				const {
					response: { signature },
				} = await payWithSPC(
					{
						rpId: getPaymentOrigin().replace("https://", ""),
						allowedCredentials: [credential.credentialId],
						challenge: userOperationHash,
						timeout: 60000,
					},
					getPayeeOrigin(),
					getPaymentDetails("0.00"),
					address,
				);

				await bundlerClient.sendUserOperation({
					userOperation: {
						...userOperation,
						signature: `0x${signature}`,
					},
				});
			}}
		>
			Claim Coupon
		</Button>
	);
}

const getMintNftUserOperation = async (address: Address) => {
	const nonce = await getAccountNonce(publicClient, {
		sender: address,
		entryPoint: ENTRYPOINT_ADDRESS_V07,
	});

	console.log("nonce ", nonce);

	let userOperation: UserOperation<"v0.7"> = {
		sender: address,
		nonce,
		callData: formatMintCouponToModuleExecutionCalldata(),
		// accountGasLimits: 8000000n,
		callGasLimit: 900080n,
		verificationGasLimit: 8005650n,
		preVerificationGas: 801330n,

		maxFeePerGas: 113000000n,
		maxPriorityFeePerGas: 113000100n,
		signature: "0x",
	};

	// const gasEstimate = await bundlerClient.estimateUserOperationGas({
	// 	userOperation,
	// });

	// console.log("gasEstimate ", gasEstimate);

	// const paymasterData = await paymasterClient.sponsorUserOperation({
	// 	userOperation,
	// });

	// console.log("paymasterData", paymasterData);

	// userOperation = { ...userOperation, ...paymasterData };

	// const userOperation = {
	// 	callData:
	// 		"0x7bb374280000000000000000000000004a56fd1d63d99978fdb3ac5c152ea122514b6792000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000443efc46400000000000000000000000000000000000000000000000000000000",
	// 	initCode: "0x",
	// 	callGasLimit: "117688",
	// 	verificationGasLimit: "61421",
	// 	preVerificationGas: "285339",
	// 	maxFeePerGas: "75550508",
	// 	maxPriorityFeePerGas: "110000",
	// 	nonce: "0",
	// 	paymasterAndData: "0x",
	// 	sender: "0x2fe7892721d8279cec0f8687c4b2e922ca7b76b0",
	// 	signature: "0x",
	// };

	const userOperationHash = getUserOperationHash({
		userOperation,
		chainId: baseSepolia.id,
		entryPoint: ENTRYPOINT_ADDRESS_V07,
	});

	return { userOperation, userOperationHash };
};
