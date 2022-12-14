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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBlitzClient = exports.setupBlitzServer = exports.createHandler = exports.getRequestResponse = void 0;
const express_1 = __importDefault(require("express"));
const cookie_1 = __importDefault(require("cookie"));
const node_mocks_http_1 = require("node-mocks-http");
const next_1 = require("@blitzjs/next");
const auth_1 = require("@blitzjs/auth");
const rpc_1 = require("./rpc.cjs");
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
__exportStar(require("./rpc.cjs"), exports);
var client_1 = require("./client.cjs");
Object.defineProperty(exports, "setupBlitzClient", { enumerable: true, get: function () { return client_1.setupBlitzClient; } });
//# sourceMappingURL=server.js.map