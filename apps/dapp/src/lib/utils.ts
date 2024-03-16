import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
	defaultInstrument,
	fromBuffer,
	getDappOrigin,
	getWalletOrigin,
	toBuffer,
} from "helpers";

type Address = `0x${string}`;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getPayeeOrigin = () =>
	getDappOrigin({ isDev: import.meta.env.DEV });

export const getPaymentOrigin = () =>
	getWalletOrigin({ isDev: import.meta.env.DEV });

type SerialisableCredentialRequestOptions = Omit<
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
	paymentDetails: PaymentDetailsInit,
	address: Address,
) => {
	const { challenge, timeout } = requestOptions;

	// - convert the allowed credential ids to a buffer
	const credentialIds = requestOptions.allowedCredentials.map((credentialId) =>
		toBuffer(credentialId),
	);

	const paymentMethodData = [
		{
			// Specify `secure-payment-confirmation` as payment method.
			supportedMethods: "secure-payment-confirmation",
			data: {
				// The RP ID
				rpId: getPaymentOrigin().replace("https://", ""),

				// List of credential IDs obtained from the RP.
				credentialIds,

				// The challenge is also obtained from the RP.
				challenge: toBuffer(challenge),

				// A display name and an icon that represent the payment instrument.
				instrument: {
					...defaultInstrument,
					displayName: `Wallet Address - ${address}`,
				},

				// The origin of the payee
				payeeOrigin: getPayeeOrigin(),

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

		console.log("spc response", response);

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
				signature: fromBuffer(cred.response.signature),
				userHandle: fromBuffer(cred.response.userHandle),
			},
		};

		await response.complete("success");

		/* send response.details to the issuing bank for verification */
	} catch (err) {
		await response.complete("fail");
		/* SPC cannot be used; merchant should fallback to traditional flows */
		console.error((err as Error).message);
		throw err;
	}
};
