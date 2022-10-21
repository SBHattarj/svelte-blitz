import express from 'express';
import cookie from 'cookie';
import { createRequest, createResponse } from 'node-mocks-http';
import { setupBlitzServer as setupBlitzServerNext } from "@blitzjs/next";
import { getSession as getBlitzSession } from "@blitzjs/auth";
import { loadServerWithBlitz } from './rpc.mjs';
// import type {Request} from "node-fetch"
const getBody = async (request) => {
    try {
        return await request.json();
    }
    catch {
        return undefined;
    }
};
export const getRequestResponse = async (event, app) => {
    const headers = {};
    event.request.headers.forEach((value, key) => {
        headers[key] = value;
    });
    const request = createRequest({
        app,
        url: event.request.url,
        headers,
        cookies: cookie.parse(event.request.headers.get('Cookie') ?? ''),
        query: Object.keys(event.params).reduce((params, key) => ({
            ...params,
            [key]: event?.params?.[key]?.split('/')
        }), {}),
        method: event.request.method,
        body: await getBody(event.request)
    });
    const response = createResponse({
        req: request
    });
    return [request, response];
};
export function createHandler(handler) {
    const svelteHandler = async (event) => {
        const app = express();
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
        const request = createRequest({
            app,
            url: event.request.url,
            headers,
            cookies: cookie.parse(event.request.headers.get('Cookie') ?? ''),
            query: Object.keys(event.params).reduce((params, key) => ({
                ...params,
                [key]: event.params?.[key]?.split('/')
            }), {}),
            method: event.request.method,
            body: await getBody(event.request)
        });
        const response = createResponse({
            req: request
        });
        const result = new Promise((resolve) => app.use((req, res, next) => {
            responsKeys.forEach((key) => {
                res[key] = express.response[key].bind(res);
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
export const setupBlitzServer = (...args) => {
    const returned = setupBlitzServerNext(...args);
    const api = (handler) => {
        return async (req, res) => {
            await getBlitzSession(req, res);
            return await returned.api(handler)(req, res);
        };
    };
    return { ...returned, loadServerWithBlitz };
};
export * from "./rpc.mjs";
export { setupBlitzClient } from "./client.mjs";
//# sourceMappingURL=server.js.map