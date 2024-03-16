import { Button } from "@/components/ui/button";
import { createSafe4337Account } from "@/lib/permissionless";

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
