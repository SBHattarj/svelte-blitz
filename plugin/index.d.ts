import type { Plugin } from 'vite';
import viteMultyIndex from "vite-multy-index-support";
import tsPath from "vite-tsconfig-paths";
export declare function svelteBlitz(viteMultyIndexOptions?: Parameters<typeof viteMultyIndex>[0], tsPathOptions?: Parameters<typeof tsPath>[0]): Plugin[];
