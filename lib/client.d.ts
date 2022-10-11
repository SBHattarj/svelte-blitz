import type { ClientPlugin } from "blitz";
import type { Load } from "@sveltejs/kit";
export declare function invoke<T extends (...args: any[]) => any>(fn: T, argument: Parameters<T>[0]): Promise<any>;
export declare function setupBlitzClient<TPlugin extends readonly ClientPlugin<object>[]>({ plugins }: {
    plugins: TPlugin;
}): {
    loadWithBlitz<T extends Load<any, any, any, void | Record<string, any>>>(load?: T | undefined): Load;
};
