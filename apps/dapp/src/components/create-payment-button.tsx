import { Button } from "@/components/ui/button";
import { payWithSPC } from "@/lib/utils";

export function CreatePaymentButton() {
	return (
		<Button
			onClick={async (e) => {
				e.preventDefault();
				console.log("Creating payment");
				await payWithSPC(
					{
						allowedCredentials: ["l8S4J0LWhvVdabcKL9tJcOApr5Qp44bi3SH88YCTOjQ"],
						challenge: "challenge",
						timeout: 60000,
					},
					{
						currency: "USD",
						value: "100.00",
					},
					"0x",
				);
			}}
		>
			Create Payment
		</Button>
	);
}
