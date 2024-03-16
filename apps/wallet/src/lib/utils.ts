import {
	toBase64UrlString,
	toBuffer,
	fromBuffer,
	getDappOrigin,
	getWalletOrigin,
} from "helpers";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const sendMessage = (message: string) => {
	window.parent.postMessage(
		{ message },
		getDappOrigin({ isDev: import.meta.env.DEV }),
	);
};

export const registerSpcCredential = async ({
	userId,
	challenge,
}: { userId: string; challenge: string }) => {
	const opts = {
		challenge: new Uint8Array(),
		rp: {
			id: getWalletOrigin({ isDev: import.meta.env.DEV }).replace(
				"https://",
				"",
			),
			name: "SPC Wallet",
		},
		user: {
			id: new Uint8Array(),
			name: "jane.doe@example.com",
			displayName: "Jane Doe",
		},
		pubKeyCredParams: [
			{
				type: "public-key",
				alg: -7, // "ES256"
			},
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

	opts.user.id = toBuffer(userId);
	opts.challenge = toBuffer(challenge);

	const cred = await navigator.credentials.create({ publicKey: opts });

	if (!cred) throw new Error("No credential returned");

	const credential = {
		id: cred.id,
		// rawId: window.base64url.encode(cred.rawId),
		type: cred.type,
	};

	if (cred.response) {
		const clientDataJSON = toBase64UrlString(cred.response.clientDataJSON);
		const attestationObject = toBase64UrlString(
			cred.response.attestationObject,
		);
		credential.response = {
			clientDataJSON,
			attestationObject,
		};
	}

	localStorage.setItem("credId", credential.id);

	// return await _fetch('/auth/registerResponse', credential);
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
