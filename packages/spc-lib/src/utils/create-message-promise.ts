import { getIframe } from "./get-Iframe";

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
