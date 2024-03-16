import { toBuffer, fromBuffer, getDappOrigin, getWalletOrigin } from "helpers";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getPayeeOrigin = () =>
	getDappOrigin({ isDev: import.meta.env.DEV });

export const getPaymentOrigin = () =>
	getWalletOrigin({ isDev: import.meta.env.DEV });

export const pageInIframe = () => window.location !== window.parent.location;

/**
 * Utility function to send a message to the parent window
 * @param message message to send to the parent window
 */
export const sendMessage = (message: string | Record<string, unknown>) => {
	window.parent.postMessage(
		typeof message === "string" ? { message } : message,
		getPayeeOrigin(),
	);
};

const defaultSpcOpts = {
	challenge: new Uint8Array(),
	rp: {
		id: getWalletOrigin({ isDev: import.meta.env.DEV }).replace("https://", ""),
		name: "SPC Wallet",
	},
	user: {
		id: new Uint8Array(),
		name: "jane.doe@example.com",
		displayName: "Jane Doe",
	},
	pubKeyCredParams: [
		{ type: "public-key", alg: -7 }, // "ES256"
	],
	authenticatorSelection: {
		userVerification: "required",
		residentKey: "required",
		authenticatorAttachment: "platform",
	},
	timeout: 360000, // 6 minutes

	// Indicate that this is an SPC credential. This is currently required to
	// allow credential creation in an iframe, and so that the browser knows this
	// credential relates to SPC.
	extensions: {
		payment: {
			isPayment: true,
		},
	},
	attestation: "none",
} satisfies Partial<
	PublicKeyCredentialCreationOptions & {
		extensions: PublicKeyCredentialCreationOptions["extensions"] & {
			payment: { isPayment: boolean };
		};
	}
>;

export const registerSpcCredential = async ({
	username,
	challenge,
}: { username: string; challenge: string }) => {
	const publicKey = { ...defaultSpcOpts };
	const usernameHash = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(username),
	);

	publicKey.user.name = username;
	publicKey.user.displayName = username;
	publicKey.user.id = new Uint8Array(usernameHash);
	publicKey.challenge = toBuffer(challenge);

	const cred = (await navigator.credentials.create({
		/**
		 *  `payment` has not been added to the `PublicKeyCredentialCreationOptions`
		 *  yet but it is available in chrome
		 *  @ts-expect-error*/
		publicKey,
	})) as PublicKeyCredential | null;

	if (!cred) throw new Error("No credential returned");

	console.log("cred", cred);
	const response = cred.response as AuthenticatorAttestationResponse;

	const publicKeyBuffer = response.getPublicKey();
	if (!publicKeyBuffer) throw new Error("No public key returned");

	const serialisableCredential = {
		id: cred.id,
		// rawId: window.base64url.encode(cred.rawId),
		type: cred.type,
		response: {
			clientDataJSON: fromBuffer(response.clientDataJSON),
			attestationObject: fromBuffer(response.attestationObject),
			publicKey: fromBuffer(publicKeyBuffer),
		},
	};

	console.log("credential", serialisableCredential);

	localStorage.setItem("credId", cred.id);

	return await fetch("/auth/register", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			username,
			credentialId: cred.id,
			publicKey: serialisableCredential.response.publicKey,
			dappName: document.referrer,
		}),
	});
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function logCreatedCredential(publicKeyCredential: any) {
	console.log("handleCreatedCredential", publicKeyCredential);
	const response = publicKeyCredential.response;

	// Access attestationObject ArrayBuffer
	const attestationObj = response.attestationObject;
	const attestationObjHex = fromBuffer(attestationObj, "hex");

	// Access client JSON
	const rawClientDataJSON = response.clientDataJSON;

	const clientDataJSON = JSON.parse(
		fromBuffer(response.clientDataJSON, "ascii"),
	);

	// Return authenticator data ArrayBuffer
	const authenticatorData = response.getAuthenticatorData();

	const authenticatorDataHex = fromBuffer(authenticatorData, "hex");

	// Return public key ArrayBuffer
	const pk = response.getPublicKey();
	const pkHex = fromBuffer(pk, "hex");

	// Return public key algorithm identifier
	const pkAlgo = response.getPublicKeyAlgorithm();

	// Return permissible transports array
	const transports = response.getTransports();

	console.log("created credential", {
		credentialId: publicKeyCredential.id,
		attestationObj,
		attestationObjHex,
		rawClientDataJSON,
		clientDataJSON,
		authenticatorData,
		authenticatorDataHex,
		pk,
		pkHex,
		pkAlgo,
		transports,
	});
}
