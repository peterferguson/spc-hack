import type { APIRoute } from "astro";
import { db, Credential, ConnectedDapps } from "astro:db";
import { z } from "zod";

const storeCredentialsSchema = z.object({
	username: z.string(),
	credentialId: z.string(),
	publicKey: z.string(),
	userHandle: z.string().optional(),
	dappName: z
		.string()
		.optional()
		.transform(
			(v) =>
				(v?.includes("://") ? new URL(v).hostname : v) ||
				"spc-wallet.vercel.app",
		),
});

export const POST: APIRoute = async (ctx) => {
	try {
		const { username, credentialId, publicKey, userHandle, dappName } =
			storeCredentialsSchema.parse(await ctx.request.json());

		console.log("registering", {
			username,
			credentialId,
			publicKey,
			userHandle,
			dappName,
		});

		await db
			.insert(Credential)
			.values({
				id: credentialId,
				username,
				publicKey,
				...(userHandle && { userHandle }),
			})
			.execute();

		await db
			.insert(ConnectedDapps)
			.values({ dappName, credentialId: credentialId })
			.execute();

		return new Response(null, { status: 204 });
	} catch (e) {
		console.log("error", e);

		return new Response((e as Error).message, { status: 500 });
	}
};
