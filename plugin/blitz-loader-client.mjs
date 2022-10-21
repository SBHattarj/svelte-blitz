import { a as assertPosixPath, c as convertPageFilePathToRoutePath, e as convertFilePathToResolverName, f as convertFilePathToResolverType } from './chunks/loader-utils.mjs';
import { posix } from 'path';
import 'blitz';
/**
 *
 * @param {string} _src
 * @param {string} id
 * @param {string} root
 * @param {{resolverPath: string}} [options]
 * @returns {Promise<string>}
 */
export default async function transformBlitzRpcResolverClient(_src, id, root, options) {
    assertPosixPath(id);
    assertPosixPath(root);
    const resolverFilePath = "/" + posix.relative(root, id);
    assertPosixPath(resolverFilePath);
    const routePath = convertPageFilePathToRoutePath(resolverFilePath, options?.resolverPath);
    const resolverName = convertFilePathToResolverName(resolverFilePath);
    const resolverType = convertFilePathToResolverType(resolverFilePath);
    const code = `
    // @ts-nocheck
    import { __internal_buildRpcClient } from "@blitzjs/rpc";
    export default __internal_buildRpcClient({
      resolverName: "${resolverName}",
      resolverType: "${resolverType}",
      routePath: "${routePath}",
    });
  `;
    return code;
}
//# sourceMappingURL=blitz-loader-client.mjs.map