import { NOW, column, defineDb, defineTable } from "astro:db";

const Credential = defineTable({
	columns: {
		id: column.text({ primaryKey: true }),
		username: column.text({ unique: true }),
		publicKey: column.text(),
		userHandle: column.text({ optional: true }),
		createdAt: column.date({ default: NOW }),
	},
});

const ConnectedDapps = defineTable({
	columns: {
		dappName: column.text(),
		credentialId: column.text({
			references: () => Credential.columns.id,
		}),
	},
	indexes: {
		dappName_credentialId_idx: {
			on: ["credentialId", "dappName"],
			unique: true,
		},
	},
});

// https://astro.build/db/config
export default defineDb({
	tables: { ConnectedDapps, Credential },
});
