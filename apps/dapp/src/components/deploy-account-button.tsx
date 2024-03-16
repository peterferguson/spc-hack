import { Button } from "@/components/ui/button";
import { createSafe4337Account } from "@/lib/safe-account";

export function DeployAccountButton() {
	return (
		<Button
			onClick={async (e) => {
				e.preventDefault();
				console.log("uop");
				console.log(await createSafe4337Account());
			}}
		>
			Deploy Account
		</Button>
	);
}
