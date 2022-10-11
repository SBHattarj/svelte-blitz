import express, { type Express, type RequestHandler, type Response as ExpressResponse } from 'express';
import type { RequestEvent, RequestHandler as SvelteRequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { createRequest, createResponse, type RequestMethod } from 'node-mocks-http';
import type { BlitzNextApiResponse } from '@blitzjs/next';
import type {NextApiRequest} from "next"
import { setupBlitzServer as setupBlitzServerNext } from "@blitzjs/next";
import {getSession as getBlitzSession} from "@blitzjs/auth"
import { loadServerWithBlitz } from './rpc';
import glob from "glob"
import path from "path"
import type { Plugin } from 'vite';
import transformBlitzRpcResolverClient from './blitz-loader-client.mjs';
import transformBlitzRpcServer, { collectResolvers } from './blitz-loader-server.mjs';
import viteMultyIndex from "vite-multy-index-support"
import tsPath from "vite-tsconfig-paths"
import { sveltekit } from '@sveltejs/kit/vite';
// import type {Request} from "node-fetch"

const getBody = async (request: Request) => {
	try {
		return await request.json() as object;
	} catch {
		return undefined;
	}
};
export const getRequestResponse = async (event: RequestEvent, app?: Express) => {
	const headers: { [key: string]: string } = {};
		event.request.headers.forEach((value, key) => {
			headers[key] = value;
		});
	const request = createRequest({
		app,
		url: event.request.url,
		headers,
		cookies: cookie.parse(event.request.headers.get('Cookie') ?? ''),
		query: Object.keys(event.params).reduce(
			(params, key) => ({
				...params,
				[key]: event?.params?.[key]?.split('/')
			}),
			{}
		),
		method: event.request.method as RequestMethod,
		body: await getBody(event.request)
	});
	const response = createResponse({
		req: request
	});
	return [request, response]
}
export function createHandler<T extends RequestEvent = RequestEvent, query extends {} = {}>(handler: (req: NextApiRequest & {query: {[key in keyof T['params']]: string} & query}, res: BlitzNextApiResponse) => any): SvelteRequestHandler {
	const svelteHandler: SvelteRequestHandler = async (event) => {
		
		const app = express();
		const responsKeys: (
			| 'status'
			| 'links'
			| 'send'
			| 'json'
			| 'jsonp'
			| 'sendStatus'
			| 'sendFile'
			| 'sendfile'
			| 'download'
			| 'contentType'
			| 'type'
			| 'format'
			| 'attachment'
			| 'append'
			| 'set'
			| 'header'
			| 'get'
			| 'clearCookie'
			| 'cookie'
			| 'location'
			| 'redirect'
			| 'vary'
			| 'render'
		)[] = [
			'status',
			'links',
			'send',
			'json',
			'jsonp',
			'sendStatus',
			'sendFile',
			'sendfile',
			'download',
			'contentType',
			'type',
			'format',
			'attachment',
			'append',
			'set',
			'header',
			'get',
			'clearCookie',
			'cookie',
			'location',
			'redirect',
			'vary',
			'render'
		];
		const headers: { [key: string]: string } = {};
		event.request.headers.forEach((value, key) => {
			headers[key] = value;
		});
		const request = createRequest({
			app,
			url: event.request.url,
			headers,
			cookies: cookie.parse(event.request.headers.get('Cookie') ?? ''),
			query: Object.keys(event.params).reduce(
				(params, key) => ({
					...params,
					[key]: event.params?.[key]?.split('/')
				}),
				{}
			),
			method: event.request.method as RequestMethod,
			body: await getBody(event.request)
		});
		const response = createResponse({
			req: request
		});
		const result = new Promise<Response>((resolve) =>
			app.use((req, res, next) => {
				responsKeys.forEach((key) => {
					(res as any)[key] = express.response[key].bind(res);
				});
				
				res.end = function (this: ExpressResponse, chunk: any, encoding: any, callback: any) {
                    resolve(new Response(chunk, {
						status: res.statusCode,
						headers: new Headers(Object.entries(res.getHeaders()).filter((_, value) => value != null).map(([key, value]) => [key, value?.toString()]) as [string, string][])
					}))
					return this;
				}.bind(res) as typeof res.end;
				next();
			})
		);
		app.use(handler as any);
		app(request, response);
		return await result;
	};
    return svelteHandler
}

export const setupBlitzServer = (...args: Parameters<typeof setupBlitzServerNext>) => {
    const returned = setupBlitzServerNext(...args)
    const api: typeof returned.api = (handler) => {
        return async (req, res) => {
            await getBlitzSession(req, res)
            return await returned.api(handler)(req, res)
        }
    }
    return {...returned, loadServerWithBlitz}
}

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
				if(code.includes("require(") || code.includes("exports") || code.includes("module")) return
				return `
					// import process from "process"
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

export * from "./rpc"