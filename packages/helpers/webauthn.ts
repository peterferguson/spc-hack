import { fromBuffer, toBuffer } from "./base64url";

// - adapted from https://github.com/jamesmccomish/test-eip-7212/blob/master/utils/passkeys.ts
export const importPublicKeyAsCryptoKey = async (
	publicKey: ArrayBuffer,
): Promise<CryptoKey | null> => {
	try {
		const key = await crypto.subtle.importKey(
			// The getPublicKey() operation thus returns the credential public key as a SubjectPublicKeyInfo. See:
			// https://w3c.github.io/webauthn/#sctn-public-key-easy
			// crypto.subtle can import the spki format:
			// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
			"spki", // "spki" Simple Public Key Infrastructure rfc2692
			publicKey,
			{
				// these are the algorithm options
				// await cred.response.getPublicKeyAlgorithm() // returns -7
				// -7 is ES256 with P-256 // search -7 in https://w3c.github.io/webauthn
				// the W3C webcrypto docs:
				// https://www.w3.org/TR/WebCryptoAPI/#informative-references (scroll down a bit)
				// ES256 corrisponds with the following AlgorithmIdentifier:
				name: "ECDSA",
				namedCurve: "P-256",
				hash: { name: "SHA-256" },
			},
			true, //whether the key is extractable (i.e. can be used in exportKey)
			["verify"], //"verify" for public key import, "sign" for private key imports
		);
		return key;
	} catch (e) {
		console.error(e);
		return null;
	}
};

export const getXandY = async (pk: CryptoKey) => {
	const jwkKey = await crypto.subtle.exportKey("jwk", pk);

	if (!jwkKey.x || !jwkKey.y) throw new Error("No x and y in jwkKey");

	const xBuffer = toBuffer(jwkKey.x, "base64");

	const yBuffer = toBuffer(jwkKey.y, "base64");

	return { x: fromBuffer(xBuffer, "hex"), y: fromBuffer(yBuffer, "hex") };
};
