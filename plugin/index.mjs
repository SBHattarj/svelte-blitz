import transformBlitzRpcResolverClient from './blitz-loader-client.mjs';
import transformBlitzRpcServer, { collectResolvers } from './blitz-loader-server.mjs';
import viteMultyIndex from "vite-multy-index-support";
import tsPath from "vite-tsconfig-paths";
import glob from "glob";
import path from "path";
import { sveltekit } from '@sveltejs/kit/vite';
import fs from "fs-extra";
import { execSync } from "child_process";
const getRootImports = (excludes = [], extensions = ["js", "ts"], cwd = process.cwd()) => Object.fromEntries(glob.sync("**/*.*", { cwd })
    .reverse()
    .filter(directory => ![...excludes, "node_modules"].some(exclude => directory.startsWith(exclude)))
    .map(directory => [directory.replace(new RegExp(`(\\/index\\.|\\.)(${extensions.join("|")})$`), ""), path.resolve(cwd, directory)]));
export function svelteBlitz(viteMultyIndexOptions, tsPathOptions) {
    return [
        tsPath(tsPathOptions),
        ...sveltekit(),
        viteMultyIndex(viteMultyIndexOptions),
        {
            name: "node-polyfills|root-bare-imports",
            enforce: "pre",
            config(config, env) {
                const packageJSON = fs.readJSONSync(`${process.cwd()}/package.json`, 'utf-8');
                const apiExists = fs.existsSync(`${process.cwd()}/src/routes/api/rpc/[...blitz]/+server.ts`);
                const prismaSetup = packageJSON?.prisma?.schema === "db/schema.prisma";
                const prismaGenerateScriptExists = packageJSON?.scripts?.generate === "blitz prisma generate";
                const prismaIsInstalled = "prisma" in (packageJSON?.dependencies ?? {});
                const prismaClientIsInstalled = "@prisma/client" in (packageJSON?.dependencies ?? {});
                const schemaExists = fs.existsSync(`${process.cwd()}/db/schema.prisma`);
                const dbExists = fs.existsSync(`${process.cwd()}/db/index.ts`);
                const dbSeedsExists = fs.existsSync(`${process.cwd()}/db/seeds.ts`);
                const blitzClientExists = fs.existsSync(`${process.cwd()}/app/blitz-client.ts`);
                const blitzServerExists = fs.existsSync(`${process.cwd()}/app/blitz-server.ts`);
                const layoutServerExists = fs.existsSync(`${process.cwd()}/src/routes/+layout.server.ts`);
                const layoutExists = fs.existsSync(`${process.cwd()}/src/routes/+layout.ts`);
                if (!apiExists) {
                    fs.ensureFileSync(`${process.cwd()}/src/routes/api/rpc/[...blitz]/+server.ts`);
                    fs.writeFileSync(`${process.cwd()}/src/routes/api/rpc/[...blitz]/+server.ts`, `import {createHandler} from 'svelte-blitz';
	import { api } from 'app/blitz-server';
	import { rpcHandler } from '@blitzjs/rpc';
	
	const handler = createHandler(api(rpcHandler(console.info as any)));
	
	export const POST = handler
	export const HEADER = handler`);
                }
                if (!prismaSetup)
                    fs.writeJSONSync(`${process.cwd()}/package.json`, { ...(packageJSON ?? {}), prisma: { schema: "db/schema.prisma" } }, { spaces: 4 });
                if (!prismaIsInstalled)
                    execSync("npm i prisma", { stdio: [0, 1, 2] });
                if (!prismaClientIsInstalled)
                    execSync("npm i @prisma/client", { stdio: [0, 1, 2] });
                if (!prismaGenerateScriptExists) {
                    fs.writeJSONSync(`${process.cwd()}/package.json`, { ...packageJSON, scripts: { ...(packageJSON?.scripts), generate: "blitz prisma generate" } }, { spaces: 4 });
                    execSync("npm run generate", { stdio: [0, 1, 2] });
                }
                if (!schemaExists) {
                    fs.ensureFileSync(`${process.cwd()}/db/schema.prisma`);
                    fs.writeFileSync(`${process.cwd()}/db/schema.prisma`, `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

datasource db {
	provider = "sqlite"
	url      = env("DATABASE_URL")
}

generator client {
	provider = "prisma-client-js"
}

// --------------------------------------

model Visitor {
	number Int @id @default(autoincrement())
}`);
                }
                if (!dbExists) {
                    fs.ensureFileSync(`${process.cwd()}/db/index.ts`);
                    fs.writeFileSync(`${process.cwd()}/db/index.ts`, `import { enhancePrisma } from 'blitz';
import { PrismaClient } from '@prisma/client';

const EnhancedPrisma = enhancePrisma(PrismaClient);
const db = new EnhancedPrisma();
export default db;`);
                }
                if (!dbSeedsExists) {
                    fs.ensureFileSync(`${process.cwd()}/db/seeds.ts`);
                    fs.writeFileSync(`${process.cwd()}/db/seeds.ts`, `// import db from "./index"

/*
	* This seed function is executed when you run \`blitz db seed\`.
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
`);
                }
                if (!blitzClientExists) {
                    fs.ensureFileSync(`${process.cwd()}/app/blitz-client.ts`);
                    fs.writeFileSync(`${process.cwd()}/app/blitz-client.ts`, `import { AuthClientPlugin } from "@blitzjs/auth"
import { setupBlitzClient } from "svelte-blitz"
import { BlitzRpcPlugin } from "@blitzjs/rpc"

export const authConfig = {
	cookiePrefix: "blitz",
}

export const { loadWithBlitz } = setupBlitzClient({
	plugins: [AuthClientPlugin(authConfig), BlitzRpcPlugin({})],
})`);
                }
                if (!blitzServerExists) {
                    fs.ensureFileSync(`${process.cwd()}/app/blitz-server.ts`);
                    fs.writeFileSync(`${process.cwd()}/app/blitz-server.ts`, `import { setupBlitzServer } from 'svelte-blitz';
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
});`);
                }
                if (!layoutServerExists) {
                    fs.ensureFileSync(`${process.cwd()}/src/routes/+layout.server.ts`);
                    fs.writeFileSync(`${process.cwd()}/src/routes/+layout.server.ts`, `import { loadServerWithBlitz } from "app/blitz-server";
import type { LayoutServerLoad } from "./$types";

export const load = loadServerWithBlitz<LayoutServerLoad>()`);
                }
                if (!layoutExists) {
                    fs.ensureFileSync(`${process.cwd()}/src/routes/+layout.ts`);
                    fs.writeFileSync(`${process.cwd()}/src/routes/+layout.ts`, `import type { LayoutLoad } from "./$types";
import { loadWithBlitz } from "app/blitz-client";

export const load = loadWithBlitz<LayoutLoad>()`);
                }
                return {
                    ...config,
                    resolve: {
                        ...(config.resolve ?? {}),
                        alias: {
                            ...(config.resolve?.alias ?? {}),
                            ...getRootImports(["vite-multy-index-support"]),
                            process: "rollup-plugin-node-polyfills/polyfills/process-es6",
                            http: "rollup-plugin-node-polyfills/polyfills/http",
                            "stream/web": "stream/web",
                            stream: "rollup-plugin-node-polyfills/polyfills/stream",
                            events: "rollup-plugin-node-polyfills/polyfills/events",
                            "svelte-blitz/plugin": "svelte-blitz/plugin/index.mjs"
                        }
                    },
                    server: {
                        ...(config.server ?? {}),
                        fs: {
                            ...(config.server?.fs ?? {}),
                            allow: [
                                ...(config.server?.fs?.allow ?? []),
                                "."
                            ],
                            deny: [
                                ...(config.server?.fs?.deny ?? []),
                                "./vite.config.ts"
                            ]
                        }
                    }
                };
            }
        },
        {
            name: "process-globalThis-dirname-polyfill",
            transform(code, id, options) {
                if (id.endsWith(".css"))
                    return;
                if (code.includes("require(") || code.includes("exports") || code.includes("module"))
                    return;
                return `
					if(typeof process === "undefined") {
						globalThis.process = {}
					}
					if(process.env == null) process.env = import.meta.env
					if(typeof __dirname === "undefined") globalThis.__dirname = import.meta.url
					globalThis.global = globalThis
					${code}
				`;
            },
            enforce: "pre"
        },
        {
            async load(id, options) {
                if (options?.ssr || !/[\\/](queries|mutations)[\\/]/.test(id))
                    return;
                console.log(id);
                return await transformBlitzRpcResolverClient('', id, process.cwd());
            },
            enforce: "pre",
            name: "blitz-loader:client",
        },
        {
            name: "blitz-loader:server",
            enforce: "pre",
            async transform(code, id, options) {
                if (!options?.ssr || !(id.includes('[...blitz]/+server.')))
                    return;
                const resolvers = await collectResolvers(process.cwd(), ['ts', 'js']);
                return await transformBlitzRpcServer(code, id, process.cwd(), resolvers);
            },
        },
    ];
}
//# sourceMappingURL=plugin.js.map