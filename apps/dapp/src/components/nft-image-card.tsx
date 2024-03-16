import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getNftUri } from "@/lib/example-nft";
import React from "react";

export function NftImageCard() {
	const tokenId = 1n;
	const [uri, setUri] = React.useState<string | null>(null);

	React.useEffect(() => {
		getNftUri(tokenId).then((r) => setUri(r));
	}, [tokenId]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card Description</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Card Content: {uri}</p>
			</CardContent>
			<CardFooter>
				<p>Card Footer</p>
			</CardFooter>
		</Card>
	);
}
