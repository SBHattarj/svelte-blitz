import type { UserConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteBlitz } from './@blitzjs/sveltekit/plugin';

const config: UserConfig = {
	plugins: [
		svelteBlitz({
			exclude: ["@prisma/client"]
		})
	],
	resolve: {
		alias: {
			"@sveltejs/kit/vite": "@sveltejs/kit/src/exports/vite"
		}
	}
};

export default config;
