import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
// import node from "@astrojs/node";
import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
	output: "server",
	integrations: [
		db(),
		react(),
		tailwind({ applyBaseStyles: false }),
		// ! deploying to firebase with ssr not working ¯\_(ツ)_/¯
		// node({ mode: "middleware" }),
	],
	adapter: vercel(),
});
