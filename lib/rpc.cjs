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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadServerWithBlitz = exports.invoke = exports.setContext = exports.getContext = void 0;
const blitz_1 = require("blitz");
const rpc_1 = require("@blitzjs/rpc");
const events_1 = __importDefault(require("events"));
const blitzErrors = {
    AuthenticationError: blitz_1.AuthenticationError,
    CSRFTokenMismatchError: blitz_1.CSRFTokenMismatchError,
    AuthorizationError: blitz_1.AuthorizationError,
    NotFoundError: blitz_1.NotFoundError,
    RedirectError: blitz_1.RedirectError
};
if (!blitz_1.isClient)
    globalThis.contextEmitter = new events_1.default();
async function* contextGenerator() {
    let context = null;
    while (true) {
        const newContext = yield context;
        if (newContext == null)
            continue;
        if (context == null)
            globalThis.contextEmitter?.emit("blitz-context:first-set", newContext);
        context = newContext;
    }
}
const Context = contextGenerator();
async function getContext() {
    if (blitz_1.isClient)
        return;
    const context = (await Context.next()).value;
    if (context != null)
        return context;
    return await new Promise(resolve => globalThis.contextEmitter?.once("blitz-context:first-set", (context) => {
        resolve(context);
    }));
}
exports.getContext = getContext;
async function setContext(context) {
    if (blitz_1.isClient)
        return;
    await Context.next(context);
    return (await Context.next(context)).value;
}
exports.setContext = setContext;
async function invoke(fn, argument) {
    if (blitz_1.isClient)
        try {
            return await (0, rpc_1.invoke)(fn, argument);
        }
        catch (error) {
            if (error.name in blitzErrors) {
                if (error.url == null)
                    throw new blitzErrors[error.name]();
                throw new blitzErrors[error.name](error.url);
            }
            throw error;
        }
    const context = await getContext();
    return await fn(argument, context);
}
exports.invoke = invoke;
const loadServerWithBlitz = (load) => {
    return async (...args) => {
        if (blitz_1.isServer) {
            const { createRequest, createResponse } = await Promise.resolve().then(() => __importStar(require("node-mocks-http")));
            const { default: cookie } = await Promise.resolve().then(() => __importStar(require("cookie")));
            const { getSession } = await Promise.resolve().then(() => __importStar(require("@blitzjs/auth")));
            const req = createRequest({
                url: args[0].url.toString(),
                headers: Object.fromEntries(args[0].request.headers.entries()),
                cookies: args[0].cookies,
                method: "GET"
            });
            const res = createResponse({ req });
            await getSession(req, res);
            await setContext(res.blitzCtx);
            return await load?.(...args);
        }
        return await load?.(...args);
    };
};
exports.loadServerWithBlitz = loadServerWithBlitz;
//# sourceMappingURL=rpc.js.map