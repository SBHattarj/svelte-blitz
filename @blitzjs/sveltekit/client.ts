import { isClient } from "blitz";
import { invoke as blitzInvoke } from "@blitzjs/rpc";
import type { ClientPlugin } from "blitz";
// import { setupBlitzClient as setupBlitzClientNext } from "@blitzjs/next";
import type { Load } from "@sveltejs/kit";
import {invoke as invokeServer} from  "./rpc"
export async function invoke<T extends (...args: any[]) => any>(fn: T, argument: Parameters<T>[0]) {
    if(isClient) return await blitzInvoke(fn, argument)
    // const {invoke: serverInvoke} = await import("./server")
    return await invokeServer(fn, argument)

}

export function setupBlitzClient<TPlugin extends readonly ClientPlugin<object>[]>({plugins}: {plugins: TPlugin}) {
    return {
        // ...setupBlitzClientNext({plugins}),
        loadWithBlitz<T extends Load<any, any, any>>(load?: T): Load {
            return load ?? (() => {})
        }
    }
}