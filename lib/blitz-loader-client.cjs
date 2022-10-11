"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_mjs_1 = require("./chunks/loader-utils.mjs");
const path_1 = require("path");
require("blitz");
/**
 *
 * @param {string} _src
 * @param {string} id
 * @param {string} root
 * @param {{resolverPath: string}} [options]
 * @returns {Promise<string>}
 */
async function transformBlitzRpcResolverClient(_src, id, root, options) {
    (0, loader_utils_mjs_1.a)(id);
    (0, loader_utils_mjs_1.a)(root);
    const resolverFilePath = "/" + path_1.posix.relative(root, id);
    (0, loader_utils_mjs_1.a)(resolverFilePath);
    const routePath = (0, loader_utils_mjs_1.c)(resolverFilePath, options?.resolverPath);
    const resolverName = (0, loader_utils_mjs_1.e)(resolverFilePath);
    const resolverType = (0, loader_utils_mjs_1.f)(resolverFilePath);
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
exports.default = transformBlitzRpcResolverClient;
//# sourceMappingURL=blitz-loader-client.mjs.map