"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.svelteBlitz = exports.setupBlitzServer = exports.createHandler = exports.getRequestResponse = void 0;
const express_1 = __importDefault(require("express"));
const cookie_1 = __importDefault(require("cookie"));
const node_mocks_http_1 = require("node-mocks-http");
const next_1 = require("@blitzjs/next");
const auth_1 = require("@blitzjs/auth");
const rpc_1 = require("./rpc");
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const blitz_loader_client_mjs_1 = __importDefault(require("./blitz-loader-client.mjs"));
const blitz_loader_server_mjs_1 = __importStar(require("./blitz-loader-server.mjs"));
const vite_multy_index_support_1 = __importDefault(require("vite-multy-index-support"));
const vite_tsconfig_paths_1 = __importDefault(require("vite-tsconfig-paths"));
const vite_1 = require("@sveltejs/kit/vite");
// import type {Request} from "node-fetch"
const getBody = async (request) => {
    try {
        return await request.json();
    }
    catch {
        return undefined;
    }
};
const getRequestResponse = async (event, app) => {
    const headers = {};
    event.request.headers.forEach((value, key) => {
        headers[key] = value;
    });
    const request = (0, node_mocks_http_1.createRequest)({
        app,
        url: event.request.url,
        headers,
        cookies: cookie_1.default.parse(event.request.headers.get('Cookie') ?? ''),
        query: Object.keys(event.params).reduce((params, key) => ({
            ...params,
            [key]: event?.params?.[key]?.split('/')
        }), {}),
        method: event.request.method,
        body: await getBody(event.request)
    });
    const response = (0, node_mocks_http_1.createResponse)({
        req: request
    });
    return [request, response];
};
exports.getRequestResponse = getRequestResponse;
function createHandler(handler) {
    const svelteHandler = async (event) => {
        const app = (0, express_1.default)();
        const responsKeys = [
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
        const headers = {};
        event.request.headers.forEach((value, key) => {
            headers[key] = value;
        });
        const request = (0, node_mocks_http_1.createRequest)({
            app,
            url: event.request.url,
            headers,
            cookies: cookie_1.default.parse(event.request.headers.get('Cookie') ?? ''),
            query: Object.keys(event.params).reduce((params, key) => ({
                ...params,
                [key]: event.params?.[key]?.split('/')
            }), {}),
            method: event.request.method,
            body: await getBody(event.request)
        });
        const response = (0, node_mocks_http_1.createResponse)({
            req: request
        });
        const result = new Promise((resolve) => app.use((req, res, next) => {
            responsKeys.forEach((key) => {
                res[key] = express_1.default.response[key].bind(res);
            });
            res.end = function (chunk, encoding, callback) {
                resolve(new Response(chunk, {
                    status: res.statusCode,
                    headers: new Headers(Object.entries(res.getHeaders()).filter((_, value) => value != null).map(([key, value]) => [key, value?.toString()]))
                }));
                return this;
            }.bind(res);
            next();
        }));
        app.use(handler);
        app(request, response);
        return await result;
    };
    return svelteHandler;
}
exports.createHandler = createHandler;
const setupBlitzServer = (...args) => {
    const returned = (0, next_1.setupBlitzServer)(...args);
    const api = (handler) => {
        return async (req, res) => {
            await (0, auth_1.getSession)(req, res);
            return await returned.api(handler)(req, res);
        };
    };
    return { ...returned, loadServerWithBlitz: rpc_1.loadServerWithBlitz };
};
exports.setupBlitzServer = setupBlitzServer;
const getRootImports = (excludes = [], extensions = ["js", "ts"], cwd = process.cwd()) => Object.fromEntries(glob_1.default.sync("**/*.*", { cwd })
    .reverse()
    .filter(directory => ![...excludes, "node_modules"].some(exclude => directory.startsWith(exclude)))
    .map(directory => [directory.replace(new RegExp(`(\\/index\\.|\\.)(${extensions.join("|")})$`), ""), path_1.default.resolve(cwd, directory)]));
function svelteBlitz(viteMultyIndexOptions, tsPathOptions) {
    return [
        (0, vite_tsconfig_paths_1.default)(tsPathOptions),
        ...(0, vite_1.sveltekit)(),
        (0, vite_multy_index_support_1.default)(viteMultyIndexOptions),
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
                };
            }
        },
        {
            name: "process-globalThis-dirname-polyfill",
            transform(code, id, options) {
                if (code.includes("require(") || code.includes("exports") || code.includes("module"))
                    return;
                return `
					// import process from "process"
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
                return await (0, blitz_loader_client_mjs_1.default)('', id, process.cwd());
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
                const resolvers = await (0, blitz_loader_server_mjs_1.collectResolvers)(process.cwd(), ['ts', 'js']);
                return await (0, blitz_loader_server_mjs_1.default)(code, id, process.cwd(), resolvers);
            },
        },
    ];
}
exports.svelteBlitz = svelteBlitz;
__exportStar(require("./rpc"), exports);
//# sourceMappingURL=server.js.map