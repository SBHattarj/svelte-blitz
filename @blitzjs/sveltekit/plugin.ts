import type { Plugin } from 'vite';
import transformBlitzRpcResolverClient from './blitz-loader-client.mjs';
import transformBlitzRpcServer, { collectResolvers } from './blitz-loader-server.mjs';
import viteMultyIndex from "vite-multy-index-support"
import tsPath from "vite-tsconfig-paths"
import glob from "glob"
import path from "path"
import { sveltekit } from '@sveltejs/kit/vite';

const getRootImports = (excludes: string[] = [], extensions = ["js", "ts"], cwd = process.cwd()) => Object.fromEntries(
	glob.sync("**/*.*", {cwd})
	.reverse()
	.filter(directory => ![...excludes, "node_modules"].some(exclude => directory.startsWith(exclude)))
	.map(directory => [directory.replace(new RegExp(`(\\/index\\.|\\.)(${extensions.join("|")})$`), ""), path.resolve(cwd, directory)])
)


export function svelteBlitz(viteMultyIndexOptions?: Parameters<typeof viteMultyIndex>[0], tsPathOptions?: Parameters<typeof tsPath>[0]): Plugin[] {
	return [

		tsPath(tsPathOptions),
		...sveltekit(),
		viteMultyIndex(viteMultyIndexOptions),
		{
			name: "node-polyfills|root-bare-imports",
			enforce: "pre",
			config(config, env) {
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
						}
					},
					server: {
						...(config.server ?? {}),
						fs: {
							...(config.server?.fs ?? {}),
							allow: [
								...(config.server?.fs?.allow ?? []),
								"."
							]
						}
					}
				}
			}
		},
		{
			name: "process-globalThis-dirname-polyfill",
			transform(code, id, options) {
				if(id.endsWith(".css")) return
				if(code.includes("require(") || code.includes("exports") || code.includes("module")) return
				return `
					if(typeof process === "undefined") {
						globalThis.process = {}
					}
					if(process.env == null) process.env = import.meta.env
					if(typeof __dirname === "undefined") globalThis.__dirname = import.meta.url
					globalThis.global = globalThis
					${code}
				`
			},
			enforce: "pre"
		}, 
		{
			async load(id, options) {
				if (options?.ssr || !/[\\/](queries|mutations)[\\/]/.test(id)) return;
				console.log(id)
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
	]
}