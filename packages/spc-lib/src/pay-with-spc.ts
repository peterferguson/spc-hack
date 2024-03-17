import { defaultInstrument, fromBuffer, toBuffer } from "helpers";

export type Address = `0x${string}`;
export type SerialisableCredentialRequestOptions = Omit<
	Partial<PublicKeyCredentialRequestOptions>,
	"allowedCredentials" | "challenge"
> & {
	challenge: string;
	/**
	 * The allowed credential ids that are allowed to be used for the payment. Simplified to be only the base64url id
	 */
	allowedCredentials: string[];
};

export const payWithSPC = async (
	requestOptions: SerialisableCredentialRequestOptions,
	payeeOrigin: string,
	paymentDetails: PaymentDetailsInit,
	address: Address,
) => {
	const { challenge, timeout } = requestOptions;

	// - convert the allowed credential ids to a buffer
	const credentialIds = requestOptions.allowedCredentials
		.map((credentialId) => {
			const credential = toBuffer(credentialId);

			// - verify credentialId is reasonable
			if (credential.byteLength > 32) return undefined;

			return credential;
		})
		.filter(Boolean);

	const paymentMethodData = [
		{
			// Specify `secure-payment-confirmation` as payment method.
			supportedMethods: "secure-payment-confirmation",
			data: {
				// The RP ID
				rpId: requestOptions.rpId,

				// List of credential IDs obtained from the RP.
				credentialIds,

				// The challenge is also obtained from the RP.
				challenge: toBuffer(challenge),

				// A display name and an icon that represent the payment instrument.
				instrument: {
					...defaultInstrument,
					displayName: `Sent From Wallet - ${address}`,
				},

				// The origin of the payee
				payeeOrigin,

				// The number of milliseconds to timeout.
				timeout,
			},
		},
	];

	console.log("spc paymentMethodData", paymentMethodData, paymentDetails);

	const request = new PaymentRequest(paymentMethodData, paymentDetails);

	console.log("spc request", JSON.stringify(request));

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let response: any;
	try {
		response = await request.show();

		console.log("spc response", response, response.details);

		// response.details is a PublicKeyCredential, with a clientDataJSON that
		// contains the transaction data for verification by the issuing bank.
		const cred = response.details;

		// TODO: send the wallet the response for verification before executing the payment
		const serialisableCredential = {
			id: cred.id,
			type: cred.type,
			// credential.rawId = base64url.encode(cred.rawId);
			response: {
				clientDataJSON: fromBuffer(cred.response.clientDataJSON),
				authenticatorData: fromBuffer(cred.response.authenticatorData),
				signature: fromBuffer(cred.response.signature, "hex"),
				userHandle: fromBuffer(cred.response.userHandle),
			},
		};

		await response.complete("success");

		/* send response.details to the issuing bank for verification */
		return serialisableCredential;
	} catch (err) {
		await response.complete("fail");
		/* SPC cannot be used; merchant should fallback to traditional flows */
		console.error((err as Error).message);
		throw err;
	}
};
