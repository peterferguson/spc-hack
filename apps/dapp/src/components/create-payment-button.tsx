import { Button } from "@/components/ui/button";
import { WALLET_IFRAME_DIALOG_ID } from "@/lib/constants";
import { getPaymentOrigin, payWithSPC } from "@/lib/utils";
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
 * Get the available credentials from the wallet iframe
 */
const getAvailableCredentials = async () => {
	const iframe = getIframe();

	if (!iframe) throw new Error("No iframe found");

	const iframeOrigin = iframe?.src ? new URL(iframe.src).origin : undefined;

	// - Create a Promise that resolves when the expected message is received
	const createCredentialsPromise = (): Promise<string[]> => {
		let timeout: NodeJS.Timeout | undefined;

		const credentialsPromise: Promise<string[]> = new Promise(
			(resolve, reject) => {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				function handleMessage(event: any) {
					const eventOrigin = new URL(event.origin).origin;
					if (eventOrigin !== iframeOrigin) return;

					console.log("received message", event);

					switch (event.data.type) {
						case "credentials.get": {
							const parsedMessage = getAllowedCredentialsSchema.parse(
								event.data,
							);

							resolve(parsedMessage.credentials);
						}
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

	// - Ask the iframe for the available credentials
	iframe.contentWindow?.postMessage(
		{ type: "credentials.get" },
		getPaymentOrigin(),
	);

	return await createCredentialsPromise();
};

export function CreatePaymentButton() {
	return (
		<Button
			onClick={async (e) => {
				e.preventDefault();

				const allowedCredentials = await getAvailableCredentials();

				if (!allowedCredentials || allowedCredentials.length === 0) {
					return fallbackToIframeCredentialCreation();
				}

				await payWithSPC(
					{
						allowedCredentials,
						challenge: "challenge",
						timeout: 60000,
					},
					{
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
							amount:
								// - currency must be a ISO 4217 currency code
								{ currency: "USD", value: "0.0000001" },
						},
					},
					"0x",
				);
			}}
		>
			Create Payment
		</Button>
	);
}
