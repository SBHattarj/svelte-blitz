import type { UserConfig } from 'vite';
import { svelteBlitz } from './@blitzjs/sveltekit/server';

const config: UserConfig = {
	plugins: [
		svelteBlitz({
			exclude: ["@prisma/client"]
		})
	]
};

export default config;
