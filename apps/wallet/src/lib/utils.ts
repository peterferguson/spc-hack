import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import base64url from "base64url";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getPayeeDomain = () => {
	const isDev = import.meta.env.DEV;
	const domain = isDev ? "loca.lt" : "web.app";
	const payeeOrigin = `https://spc-dapp.${domain}`;

	return payeeOrigin;
};

export const sendMessage = (message: string) => {
	window.parent.postMessage({ message }, getPayeeDomain());
};


export const registerSpcCredential = async ({ userId, challenge }: { userId: string, challenge: string }) => {
  const opts = {
    attestation: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred'
    }
  } as const satisfies Partial<PublicKeyCredentialCreationOptions>;

  // const options = await _fetch('/auth/registerRequest', opts);
  const publicKey: Partial<PublicKeyCredentialCreationOptions> = opts

  publicKey.user.id = base64url.decode(userId);
  publicKey.challenge = base64url.decode(challenge);

  if (publicKey.excludeCredentials) {
    for (let cred of publicKey.excludeCredentials) {
      cred.id = base64url.decode(cred.id);
    }
  }

  const cred = await navigator.credentials.create({ publicKey });

  if (!cred) throw new Error('No credential returned');

  const credential = {
    id: cred.id,
    // rawId: base64url.encode(cred.rawId),
    type: cred.type,
  };

  if (cred.response) {
    const clientDataJSON =
      base64url.encode(cred.response.clientDataJSON);
    const attestationObject =
      base64url.encode(cred.response.attestationObject);
    credential.response = {
      clientDataJSON,
      attestationObject,
    };
  }

  localStorage.setItem(`credId`, credential.id);

  // return await _fetch('/auth/registerResponse', credential);
};
