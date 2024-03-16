export const defaultInstrument = {
	// Non-empty display name string
	displayName: " ",
	// Transparent-black pixel.
	icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==",
};

export async function isSecurePaymentConfirmationSupported(rpId: string) {
	if (!("PaymentRequest" in window)) {
		return [false, "Payment Request API is not supported"];
	}

	try {
		// The data below is the minimum required to create the request and
		// check if a payment can be made.
		const supportedInstruments = [
			{
				supportedMethods: "secure-payment-confirmation",
				data: {
					// RP's hostname as its ID
					rpId,
					// A dummy credential ID
					credentialIds: [new Uint8Array(1)],
					// A dummy challenge
					challenge: new Uint8Array(1),
					instrument: defaultInstrument,
					// A dummy merchant origin
					payeeOrigin: "https://non-existent.example",
				},
			},
		];

		const details = {
			// Dummy shopping details
			total: { label: "Total", amount: { currency: "USD", value: "0" } },
		};

		const request = new PaymentRequest(supportedInstruments, details);
		const canMakePayment = await request.canMakePayment();
		return [canMakePayment, canMakePayment ? "" : "SPC is not available"];
	} catch (error) {
		console.error(error);
		return [false, (error as Error).message];
	}
}

export const isSpcAvailable = async () =>
	// @ts-ignore
	await PaymentRequest?.isSecurePaymentConfirmationAvailable?.();
