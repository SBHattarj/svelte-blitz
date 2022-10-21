import { isClient, AuthenticationError, CSRFTokenMismatchError, AuthorizationError, NotFoundError, RedirectError, isServer } from "blitz";
import { invoke as blitzInvoke } from "@blitzjs/rpc";
import EventEmitter from "events";
const blitzErrors = {
    AuthenticationError,
    CSRFTokenMismatchError,
    AuthorizationError,
    NotFoundError,
    RedirectError
};
if (!isClient)
    globalThis.contextEmitter = new EventEmitter();
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
export async function getContext() {
    if (isClient)
        return;
    const context = (await Context.next()).value;
    if (context != null)
        return context;
    return await new Promise(resolve => globalThis.contextEmitter?.once("blitz-context:first-set", (context) => {
        resolve(context);
    }));
}
export async function setContext(context) {
    if (isClient)
        return;
    await Context.next(context);
    return (await Context.next(context)).value;
}
export async function invoke(fn, argument) {
    if (isClient)
        try {
            return await blitzInvoke(fn, argument);
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
export const loadServerWithBlitz = (load) => {
    return async (...args) => {
        if (isServer) {
            const { createRequest, createResponse } = await import("node-mocks-http");
            const { default: cookie } = await import("cookie");
            const { getSession } = await import("@blitzjs/auth");
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
//# sourceMappingURL=rpc.js.map