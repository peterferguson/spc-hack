import { Button } from "@/components/ui/button";
import { WALLET_IFRAME_DIALOG_ID } from "@/lib/constants";
import { getPaymentDetails, getPaymentOrigin, payWithSPC } from "@/lib/utils";
import { getAllowedCredentialsSchema } from "helpers";

const getIframe = () => {
	const iframeDialog = document.getElementById(
		WALLET_IFRAME_DIALOG_ID,
	) as HTMLIFrameElement | null;

	const iframe = iframeDialog?.querySelector("iframe");

	return iframe;
};

const fallbackToIframeCredentialCreation = async () => {
	// - trigger the iframe container to open so the user can create a credential
	const iframeDialog = document.getElementById(
		WALLET_IFRAME_DIALOG_ID,
	) as HTMLDialogElement | null;

	iframeDialog?.classList.remove("hidden");
	iframeDialog?.classList.add("flex");

	iframeDialog?.showModal();
};

/**
 * A utility function to wait for a message from the wallet iframe
 */
const createMessagePromise = (eventType: string): Promise<string[]> => {
	const iframe = getIframe();

	if (!iframe) throw new Error("No iframe found");

	const iframeOrigin = iframe?.src ? new URL(iframe.src).origin : undefined;

	let timeout: NodeJS.Timeout | undefined;
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
 */
const getAvailableCredentials = async () => {
	const iframe = getIframe();

	if (!iframe) throw new Error("No iframe found");

	// - Create a Promise that resolves when the expected message is received from the wallet iframe
	const waitForCredentials = async () => {
		const eventData = await createMessagePromise("credentials.get");
		const parsedMessage = getAllowedCredentialsSchema.parse(eventData);

		return parsedMessage.credentials;
	};

	// - Ask the iframe for the available credentials
	iframe.contentWindow?.postMessage(
		{ type: "credentials.get" },
		getPaymentOrigin(),
	);

	return await waitForCredentials();
};

export function CreatePaymentButton() {
	return (
		<Button
			id="create-payment-button"
			onClick={async (e) => {
				e.preventDefault();

				const allowedCredentials = await getAvailableCredentials();

				console.log("allowedCredentials", allowedCredentials);

				if (!allowedCredentials || allowedCredentials.length === 0) {
					return fallbackToIframeCredentialCreation();
				}

				await payWithSPC(
					{
						allowedCredentials,
						challenge: "challenge",
						timeout: 60000,
					},
					getPaymentDetails("0.0000001"),
					"0x123...456",
				);
			}}
		>
			Create Payment
		</Button>
	);
}
