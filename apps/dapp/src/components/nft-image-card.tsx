import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getNftUri, getBalance } from "@/lib/example-nft";
import React from "react";
import { CreatePaymentButton } from "./create-payment-button";

export function NftImageCard() {
	const [uri, setUri] = React.useState<string | null>(null);
	const [hasClaimed, setHasClaimed] = React.useState(false);

	React.useEffect(() => {
		getNftUri(0n).then((r) => setUri(r));
	}, []);

	React.useEffect(() => {
		getBalance("0x3896a2938d345d3A351cE152AF1b8Cb17bb006be", 0n).then((r) => {
			console.log({ r });
			setHasClaimed(r > 0);
		});
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle>10 Eth Coupon</CardTitle>
				<CardDescription>
					Claim your free 10 eth coupon which can
				</CardDescription>
			</CardHeader>
			<CardContent className="flex justify-center">
				{uri && <img src={uri} alt="NFT" />}
			</CardContent>
			<CardFooter className="flex justify-center">
				{hasClaimed ? (
					<p className="text-center">You have claimed</p>
					// TODO: add the txHash of the claim
				) : (
					<CreatePaymentButton />
				)}
			</CardFooter>
		</Card>
	);
}
