import { getAllowedCredentialsSchema } from "../validators";
import { getIframe } from "./get-Iframe";
import { createMessagePromise } from "./create-message-promise";

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
