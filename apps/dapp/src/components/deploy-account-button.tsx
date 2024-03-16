import { Button } from "@/components/ui/button";
import { userOperationReceipt } from "@/lib/viem";

export function DeployAccountButton() {
	return (
		<Button
			onClick={async (e) => {
				e.preventDefault();
				console.log("uop");
				console.log(userOperationReceipt);
			}}
		>
			Deploy Account
		</Button>
	);
}
