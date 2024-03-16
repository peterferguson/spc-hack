import { Button } from "@/components/ui/button";
import { payWithSPC } from "@/lib/utils";

export function CreatePaymentButton() {
	return (
		<Button
			onClick={async (e) => {
				e.preventDefault();
				await payWithSPC(
					{
						allowedCredentials: ["l8S4J0LWhvVdabcKL9tJcOApr5Qp44bi3SH88YCTOjQ"],
						challenge: "challenge",
						timeout: 60000,
					},
					{
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
							amount:
								// - currency must be a ISO 4217 currency code
								{ currency: "USD", value: "0.0000001" },
						},
					},
					"0x",
				);
			}}
		>
			Create Payment
		</Button>
	);
}
