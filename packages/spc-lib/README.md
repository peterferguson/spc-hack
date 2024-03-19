# Secure Confirmation Payment Library

This library lets dapps create & operate a passkey wallet from any provider.
What is even better is the user never has to leave the dapps site!

All transactions are confirmed on the dapps webpage using the wallets passkey credentials.

<img width="706" alt="image" src="https://github.com/peterferguson/spc-hack/assets/7002211/c8dfa813-64d2-490d-8c0f-452486f54e00">

The wallet will need to support Secure Payment Confirmation (SPC) & some conventions defined in this repo.

## Getting started (For dApps)

The first step is to embed the iframe of the wallet provider that you want to adopt e.g. `https://spc-wallet.vercel.app`

In our example we are using astro but you can use whatever framework you like.

```html
<iframe name="iframe" allow={`payment ${paymentOrigin}`}></iframe>
```

The frames parent should then be assigned the `id` corresponding that given by the `spc-lib`
Since a fallback UI is shown from the wallet if the user has never registered before the parent container should probably be a modal of some sort.

```tsx
import { WALLET_IFRAME_DIALOG_ID } from "spc-lib";

<Parent id={WALLET_IFRAME_DIALOG_ID}>
{...}
</Parent>
```

The most important function in this library is [`payWithSpc`](https://github.com/peterferguson/spc-hack/blob/update-readmes/packages/spc-lib/src/pay-with-spc.ts)
it handles building and executing the SPC payment request & returning the signature that is used to bundle the `UserOp`. [Example usage](https://github.com/peterferguson/spc-hack/blob/update-readmes/apps/dapp/src/components/claim-coupon-button.tsx):

```tsx
const [credential] =
	(await getAvailableCredentials(getPaymentOrigin())) ?? [];

const address = credential?.address as Address | undefined;
if (!address) {
	return fallbackToIframeCredentialCreation();
}

const { userOperation, userOperationHash } =
	await getMintNftUserOperation(address);

const {
	response: { signature },
} = await payWithSPC(
	{
		rpId: getPaymentOrigin().replace("https://", ""),
		allowedCredentials: [credential.credentialId],
		challenge: userOperationHash,
		timeout: 60000,
	},
	getPayeeOrigin(),
	getPaymentDetails("0.00"),
	address,
);

await bundlerClient.sendUserOperation({
	userOperation: {
		...userOperation,
		signature: `0x${signature}`,
	},
});
```

## Getting started (For Wallet Providers)


