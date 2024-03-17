import { Button } from "@/components/ui/button";
import { getPayeeOrigin, getPaymentOrigin } from "@/lib/utils";
import {
	getPaymentDetails,
	payWithSPC,
	getAvailableCredentials,
	fallbackToIframeCredentialCreation,
} from "spc-lib";

export function CreatePaymentButton() {
	return (
		<Button
			id="create-payment-button"
			onClick={async (e) => {
				e.preventDefault();

				const allowedCredentials = await getAvailableCredentials(
					getPaymentOrigin(),
				);

				console.log("allowedCredentials", allowedCredentials);

				if (!allowedCredentials || allowedCredentials.length === 0) {
					return fallbackToIframeCredentialCreation();
				}

				await payWithSPC(
					{
						rpId: getPaymentOrigin().replace("https://", ""),
						allowedCredentials,
						challenge: "challenge",
						timeout: 60000,
					},
					getPayeeOrigin(),
					getPaymentDetails("0.0000001"),
					"0x123...456",
				);
			}}
		>
			Create Payment
		</Button>
	);
}
