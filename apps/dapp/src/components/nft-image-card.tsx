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
import { ClaimCouponButton } from "./claim-coupon-button";
import { useLocalStorage } from "usehooks-ts";
import type { Address } from "viem";

export function NftImageCard() {
	const [uri, setUri] = React.useState<string | null>(null);
	const [hasClaimed, setHasClaimed] = React.useState(false);
	const [address] = useLocalStorage<Address | undefined>("address", undefined);

	React.useEffect(() => {
		getNftUri(0n).then((r) => setUri(r));
	}, []);

	React.useEffect(() => {
		getBalance(address, 0n).then((r) => setHasClaimed(r > 0));
	}, [address]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>10 Eth Coupon</CardTitle>
				<CardDescription>
					Claim your free 10 eth coupon which can
				</CardDescription>
			</CardHeader>
			<CardContent className="flex justify-center min-h-[168px]">
				{uri && <img src={uri} alt="NFT" />}
			</CardContent>
			<CardFooter className="flex justify-center">
				{hasClaimed ? (
					<p className="text-center">You have claimed</p>
					// TODO: add the txHash of the claim
				) : (
					<ClaimCouponButton />
				)}
			</CardFooter>
		</Card>
	);
}
