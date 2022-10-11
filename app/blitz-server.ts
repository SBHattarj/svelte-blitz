import { setupBlitzServer } from '@blitzjs/sveltekit/server';
import { AuthServerPlugin, PrismaStorage } from '@blitzjs/auth';
import db from 'db';
import { simpleRolesIsAuthorized } from '@blitzjs/auth';
import { authConfig } from './blitz-client';
export const { gSSP, gSP, api, loadServerWithBlitz } = setupBlitzServer({
	plugins: [
		AuthServerPlugin({
			...authConfig,
			storage: PrismaStorage(db as any),
			isAuthorized: simpleRolesIsAuthorized
		})
	]
});
