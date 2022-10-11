/**
 *
 * @param {string} _src
 * @param {string} id
 * @param {string} root
 * @param {{resolverPath: string}} [options]
 * @returns {Promise<string>}
 */
export default function transformBlitzRpcResolverClient(_src: string, id: string, root: string, options?: {
    resolverPath: string;
} | undefined): Promise<string>;
