import { z } from "zod";

export const getAllowedCredentialsMessageTypeSchema = z.enum([
	"credentials.get",
]);

export const getAllowedCredentialsSchema = z.object({
	type: getAllowedCredentialsMessageTypeSchema,
	credentials: z.array(
		z.object({ credentialId: z.string(), address: z.string().optional() }),
	),
});
