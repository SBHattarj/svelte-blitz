# Svelte Blitz

A svelte port for blitzjs

If you want to injoy blitzjs features within sveltekit then this is right for you!

If you want to install this you can do so using the following:
```properties
npm i svelte-blitz
```

You can start using this by first creating the default sveltekit typescript barebones project and then following these steps:

1. change contents of vite.config.ts to the following
```ts
import type { UserConfig } from 'vite';
import { svelteBlitz } from 'svelte-blitz/plugin';

const config: UserConfig = {
	plugins: [
		svelteBlitz({
			exclude: ["@prisma/client"]
		})
	]
};

export default config;

```

2. create file src/routes/api/rpc/[...blitz]/+server.ts and add the following content:
```ts
import {createHandler} from 'svelte-blitz';
import { api } from 'app/blitz-server';
import { rpcHandler } from '@blitzjs/rpc';

const handler = createHandler(api(rpcHandler(console.info as any)));

export const POST = handler
export const HEADER = handler
```
3. install prisma, @prisma/client and blitz via npm and add the given lines to package.json
```json
    "prisma": {
		"schema": "db/schema.prisma"
    },
```

4. create db/schema.prisma, db/index.ts, db/seeds.ts

5. add the following to db/index.ts 
```ts
import { enhancePrisma } from 'blitz';
import { PrismaClient } from '@prisma/client';

const EnhancedPrisma = enhancePrisma(PrismaClient);
const db = new EnhancedPrisma();
export default db;

```

6. add the following to db/seeds.ts
```ts
// import db from "./index"

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * to easily generate realistic data.
 */
const seed = async () => {
	// for (let i = 0; i < 5; i++) {
	//   await db.project.create({ data: { name: "Project " + i } })
	// }
};

export default seed;

```

7. create files app/blitz-client.ts and app/blitz-server.ts

8. add following to app/blitz-client.ts

```ts
import { AuthClientPlugin } from "@blitzjs/auth"
import { setupBlitzClient } from "svelte-blitz"
import { BlitzRpcPlugin } from "@blitzjs/rpc"

export const authConfig = {
  cookiePrefix: "blitz",
}

export const { loadWithBlitz } = setupBlitzClient({
  plugins: [AuthClientPlugin(authConfig), BlitzRpcPlugin({})],
})

```

9. add following to app/blitz-server.ts
```ts
import { setupBlitzServer } from 'svelte-blitz';
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

```

10. create files src/routes/+layout.server.ts and src/routes/+layout.server.ts

11. add following to src/routes/+layout.server.ts
```ts
import { loadServerWithBlitz } from "app/blitz-server";
import type { LayoutServerLoad } from "./$types";

export const load = loadServerWithBlitz<LayoutServerLoad>()
```

12. add following to src/routes/+layout.ts
```ts
import type { LayoutLoad } from "./$types";
import { loadWithBlitz } from "app/blitz-client";

export const load = loadWithBlitz<LayoutLoad>()
```

13. then run 
```properties 
blitz prisma generate
```

This should allow you to use prisma. to use invoke you'll be importing it from svelte-blitz

you can transform sveltekit handler to next like handler by using the createHandler method.

If you want to help you can contact me directly.

Happy coding.