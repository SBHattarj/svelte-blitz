"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBlitzClient = exports.invoke = void 0;
const blitz_1 = require("blitz");
const rpc_1 = require("@blitzjs/rpc");
const rpc_2 = require("./rpc");
async function invoke(fn, argument) {
    if (blitz_1.isClient)
        return await (0, rpc_1.invoke)(fn, argument);
    // const {invoke: serverInvoke} = await import("./server")
    return await (0, rpc_2.invoke)(fn, argument);
}
exports.invoke = invoke;
function setupBlitzClient({ plugins }) {
    return {
        // ...setupBlitzClientNext({plugins}),
        loadWithBlitz(load) {
            return load ?? (() => { });
        }
    };
}
exports.setupBlitzClient = setupBlitzClient;
//# sourceMappingURL=client.js.map