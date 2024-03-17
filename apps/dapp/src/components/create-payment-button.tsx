import { Button } from "@/components/ui/button";
import { formatMintCouponToModuleExecutionCalldata } from "@/lib/example-nft";
import {
	getUserOperationHash,
	ENTRYPOINT_ADDRESS_V07,
	getAccountNonce,
	type UserOperation,
} from "permissionless";
import { bundlerClient, publicClient } from "@/lib/permissionless";
import { getPayeeOrigin, getPaymentOrigin } from "@/lib/utils";
import {
	getPaymentDetails,
	payWithSPC,
	getAvailableCredentials,
	fallbackToIframeCredentialCreation,
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

				const nonce = await getAccountNonce(publicClient, {
					sender: address,
					entryPoint: ENTRYPOINT_ADDRESS_V07,
				});

				console.log("nonce ", nonce);

				const userOperation = {
					sender: address,
					nonce,
					callData: formatMintCouponToModuleExecutionCalldata(),
					// accountGasLimits: 8000000n,
					callGasLimit: 500305n,
					verificationGasLimit: 8005650n,
					preVerificationGas: 506135n,
					maxFeePerGas: 113000000n,
					maxPriorityFeePerGas: 113000100n,
					signature: "0x" as const,
				} satisfies UserOperation<"v0.7">;

				const gasEstimate = await bundlerClient.estimateUserOperationGas({
					userOperation,
				});

				console.log("gasEstimate ", gasEstimate);

				const userOperationHash = getUserOperationHash({
					userOperation,
					chainId: baseSepolia.id,
					entryPoint: ENTRYPOINT_ADDRESS_V07,
				});

				await payWithSPC(
					{
						rpId: getPaymentOrigin().replace("https://", ""),
						allowedCredentials: [credential.credentialId],
						challenge: userOperationHash,
						timeout: 60000,
					},
					getPayeeOrigin(),
					getPaymentDetails("0.0000001"),
					address,
				);
			}}
		>
			Create Payment
		</Button>
	);
}
