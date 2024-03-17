import { WALLET_IFRAME_DIALOG_ID } from "../constants";

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
