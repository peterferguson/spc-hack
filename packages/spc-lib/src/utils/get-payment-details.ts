export const getPaymentDetails = (amount: string) => ({
	// - the SPC spec allows for multiple items to be displayed
	// - but currently the Chrome implementation does NOT display ANY items
	displayItems: [
		{
			label: "NFT",
			amount: { currency: "USD", value: "0.0000001" },
			pending: true,
		},
		{
			label: "Gas Fee",
			amount: { currency: "USD", value: "0.0000001" },
			pending: true,
		},
	],
	total: {
		label: "Total",
		// - currency must be a ISO 4217 currency code
		amount: { currency: "USD", value: amount },
	},
});
