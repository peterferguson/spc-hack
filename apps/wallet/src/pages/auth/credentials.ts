import type { APIRoute } from "astro";
import { Credential, db, sql } from "astro:db";

export const GET: APIRoute = async (ctx) => {
	try {
		const username = ctx.url.searchParams.get("username");
		console.log(username);

		if (!username) {
			return new Response("username is required", { status: 400 });
		}

		console.log("checking for credential with username", username);

		const credentialId =
			(
				await db
					.select({ id: Credential.id })
					.from(Credential)
					.where(sql`${Credential.username}=${username}`)
					.limit(1)
					.get()
			)?.id ?? "";

		return new Response(credentialId, {
			status: 200,
		});
	} catch (e) {
		console.log("error", e);

		return new Response((e as Error).message, { status: 500 });
	}
};
