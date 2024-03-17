import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerSpcCredential, sendMessage } from "@/lib/utils";

const formSchema = z.object({
	username: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
});

export function UsernameForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { username: "" },
	});

	async function onSubmit({ username }: z.infer<typeof formSchema>) {
		if (!username) {
			const credentialId = await fetch(`/auth/credentials?username=${username}`)
				.then((res) => res.text())
				.catch(console.error);
			if (credentialId) {
				localStorage.setItem("credId", credentialId);
				sendMessage({ type: "credential.found", payload: { credentialId } });
				return;
			}
		}

		const registrationResponse = await registerSpcCredential({
			username,
			challenge: "challenge",
		});

		if (!registrationResponse.ok) {
			console.error("Failed to register credential", registrationResponse);
			return;
		}

		// TODO: @jamesmccomish please add a description for this route handler ... why we need to deploy from a relay instead of
		// TODO: using init code
		const deployResponse = await fetch("/relay/deploy", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username }),
		});

		const { txHash, address } = (await deployResponse.json()) ?? {};

		console.log("deployResponse", { txHash, address });

		if (txHash) localStorage.setItem("deployTxHash", txHash);
		if (address) localStorage.setItem("address", address);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input placeholder="shadcn" {...field} />
							</FormControl>
							<FormDescription>
								This is your public display name.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Submit</Button>
			</form>
		</Form>
	);
}
