/**
 *
 * @param {string} src
 * @param {string} id
 * @param {string} root
 * @param {string[]} resolvers
 * @param {{resolverBasePath: string}} [options]
 * @returns {Promise<string>}
 */
export default function transformBlitzRpcServer(src: string, id: string, root: string, resolvers: string[], options?: {
    resolverBasePath: string;
} | undefined): Promise<string>;
/**
 *
 * @param {string} directory
 * @param {string[]} pageExtensions
 * @returns {Promise<string[]>}
 */
export function collectResolvers(directory: string, pageExtensions: string[]): Promise<string[]>;
/**
 *
 * @param {string} dir
 * @param {RegExp} filter
 * @param {RegExp} [ignore]
 * @param {string[]} [arr]
 * @param {string} [rootDir]
 * @returns {Promise<string[]>}
 */
export function recursiveFindResolvers(dir: string, filter: RegExp, ignore?: RegExp | undefined, arr?: string[] | undefined, rootDir?: string | undefined): Promise<string[]>;
