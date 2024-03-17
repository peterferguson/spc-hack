import { WALLET_IFRAME_DIALOG_ID } from "./constants";
import { getAllowedCredentialsSchema } from "./validators";
import { defaultInstrument, fromBuffer, toBuffer } from "helpers";

export * from "./constants";

/**
 * A utility function to trigger the wallet iframe to open for credential creation
 */
export const fallbackToIframeCredentialCreation = async () => {
	// - trigger the iframe container to open so the user can create a credential
	const iframeDialog = document.getElementById(
		WALLET_IFRAME_DIALOG_ID,
	) as HTMLDialogElement | null;

	iframeDialog?.classList.remove("hidden");
	iframeDialog?.classList.add("flex");

	iframeDialog?.showModal();
};

/**
 * A utility function to get the iframe element
 *
 * @returns The wallet iframe
 */
export const getIframe = () => {
	const iframeDialog = document.getElementById(
		WALLET_IFRAME_DIALOG_ID,
	) as HTMLIFrameElement | null;

	const iframe = iframeDialog?.querySelector("iframe");

	return iframe;
};

/**
 * A utility function to wait for a message from the wallet iframe
 */
export const createMessagePromise = (eventType: string): Promise<string[]> => {
	const iframe = getIframe();

	if (!iframe) throw new Error("No iframe found");

	const iframeOrigin = iframe?.src ? new URL(iframe.src).origin : undefined;

	let timeout: number | undefined;
	const credentialsPromise: Promise<string[]> = new Promise(
		(resolve, reject) => {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			function handleMessage(event: any) {
				const eventOrigin = new URL(event.origin).origin;
				if (eventOrigin !== iframeOrigin) return;

				console.log("received message", event);

				if (event.data.type === eventType) {
					resolve(event.data);
				}
				// Remove the event listener to clean up
				window.removeEventListener("message", handleMessage);
			}

			// Add an event listener to listen for messages from the iframe
			window.addEventListener("message", handleMessage, false);

			// Set a timeout to reject the promise if no response is received within a specific timeframe
			timeout = setTimeout(() => {
				window.removeEventListener("message", handleMessage);
				reject(new Error("Timeout waiting for credentials response"));
			}, 10000); // 10 seconds timeout
		},
	);

	// ! Ensure to clean up on promise resolution or rejection
	credentialsPromise.finally(() => clearTimeout(timeout));

	return credentialsPromise;
};

/**
 * Get the available credentials from the wallet iframe
 *
 * @param origin The origin of the wallet iframe
 * @returns The available credentials
 */
export const getAvailableCredentials = async (origin: string) => {
	const iframe = getIframe();

	if (!iframe) throw new Error("No iframe found");

	// - Create a Promise that resolves when the expected message is received from the wallet iframe
	const waitForCredentials = async () => {
		const eventData = await createMessagePromise("credentials.get");
		const parsedMessage = getAllowedCredentialsSchema.parse(eventData);

		return parsedMessage.credentials;
	};

	// - Ask the iframe for the available credentials
	iframe.contentWindow?.postMessage({ type: "credentials.get" }, origin);

	return await waitForCredentials();
};

type Address = `0x${string}`;
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

export const getPaymentDetails = (amount: string) => ({
	// - the SPC spec allows for multiple items to be displayed
	// - but currently the Chrome implementation does NOT display ANY items
	displayItems: [
		{
			label: "NFT",
			amount: { currency: "USD", value: "0.0000001" },
			pending: true,
		},
		{
			label: "Gas Fee",
			amount: { currency: "USD", value: "0.0000001" },
			pending: true,
		},
	],
	total: {
		label: "Total",
		// - currency must be a ISO 4217 currency code
		amount: { currency: "USD", value: amount },
	},
});

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
