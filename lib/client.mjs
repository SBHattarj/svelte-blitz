import { isClient } from "blitz";
import { invoke as blitzInvoke } from "@blitzjs/rpc";
import { invoke as invokeServer } from "./rpc.mjs";
export async function invoke(fn, argument) {
    if (isClient)
        return await blitzInvoke(fn, argument);
    // const {invoke: serverInvoke} = await import("./server")
    return await invokeServer(fn, argument);
}
export function setupBlitzClient({ plugins }) {
    return {
        // ...setupBlitzClientNext({plugins}),
        loadWithBlitz(load) {
            return load ?? (() => { });
        }
    };
}
//# sourceMappingURL=client.js.map