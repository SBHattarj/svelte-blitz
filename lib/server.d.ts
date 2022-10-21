/// <reference types="qs" />
/// <reference types="node" />
/// <reference types="node" />
import express, { type Express } from 'express';
import type { RequestEvent, RequestHandler as SvelteRequestHandler } from '@sveltejs/kit';
import type { BlitzNextApiResponse } from '@blitzjs/next';
import type { NextApiRequest } from "next";
export declare const getRequestResponse: (event: RequestEvent, app?: Express) => Promise<(import("node-mocks-http").MockRequest<express.Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>> | import("node-mocks-http").MockResponse<express.Response<any, Record<string, any>>>)[]>;
export declare function createHandler<T extends RequestEvent = RequestEvent, query extends {} = {}>(handler: (req: NextApiRequest & {
    query: {
        [key in keyof T['params']]: string;
    } & query;
}, res: BlitzNextApiResponse) => any): SvelteRequestHandler;
export declare const setupBlitzServer: (args_0: {
    plugins: import("blitz").BlitzServerPlugin<import("blitz").RequestMiddleware<import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, void | Promise<void>>, import("@blitzjs/next").Ctx, {}>[];
    onError?: ((err: Error) => void) | undefined;
}) => {
    loadServerWithBlitz: <T extends import("@sveltejs/kit").ServerLoad<Partial<Record<string, string>>, Record<string, any>, void | Record<string, any>>>(load?: T | undefined) => import("@sveltejs/kit").ServerLoad<Partial<Record<string, string>>, Record<string, any>, void | Record<string, any>>;
    gSSP: <TProps, Query extends import("querystring").ParsedUrlQuery = import("querystring").ParsedUrlQuery, PD extends import("next").PreviewData = import("next").PreviewData>(handler: import("@blitzjs/next").BlitzGSSPHandler<TProps, Query, PD>) => import("next").GetServerSideProps<TProps, Query, PD>;
    gSP: <TProps_1, Query_1 extends import("querystring").ParsedUrlQuery = import("querystring").ParsedUrlQuery, PD_1 extends import("next").PreviewData = import("next").PreviewData>(handler: import("@blitzjs/next").BlitzGSPHandler<TProps_1, Query_1, PD_1>) => import("next").GetStaticProps<TProps_1, Query_1, PD_1>;
    api: <TResult = void | Promise<void>>(handler: import("@blitzjs/next").BlitzAPIHandler<TResult>) => import("@blitzjs/next").NextApiHandler<void | TResult>;
};
export * from "./rpc";
export { setupBlitzClient } from "./client";
