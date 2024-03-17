import { WALLET_IFRAME_DIALOG_ID } from "../constants";

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
