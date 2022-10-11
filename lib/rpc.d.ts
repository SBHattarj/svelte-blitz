/// <reference types="node" />
import { type Ctx } from "blitz";
import EventEmitter from "events";
import type { ServerLoad } from "@sveltejs/kit";
declare global {
    var contextEmitter: EventEmitter | null;
}
export declare function getContext(): Promise<Ctx | undefined>;
export declare function setContext(context: Ctx): Promise<Ctx | null | undefined>;
export declare function invoke<T extends (...args: any[]) => any>(fn: T, argument: Parameters<T>[0]): Promise<any>;
export declare const loadServerWithBlitz: <T extends ServerLoad<Partial<Record<string, string>>, Record<string, any>, void | Record<string, any>>>(load?: T | undefined) => ServerLoad;
