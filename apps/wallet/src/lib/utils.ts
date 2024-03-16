import { toBase64UrlString, toBuffer } from "./base64url";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getDappOrigin = () => {
	const isDev = import.meta.env.DEV;
	const domain = isDev ? "loca.lt" : "web.app";
	const origin = `https://spc-dapp.${domain}`;

	return origin;
};

export const getWalletOrigin = () => {
	const isDev = import.meta.env.DEV;
	const domain = isDev ? "loca.lt" : "web.app";
	const origin = `https://spc-wallet.${domain}`;

	return origin;
};

export const sendMessage = (message: string) => {
	window.parent.postMessage({ message }, getDappOrigin());
};

export const registerSpcCredential = async ({
	userId,
	challenge,
}: { userId: string; challenge: string }) => {
	const opts = {
		challenge: new Uint8Array(),
		rp: { id: getWalletOrigin().replace("https://", ""), name: "SPC Wallet" },
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
