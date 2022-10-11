"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformBlitzRpcServer = exports.recursiveFindResolvers = exports.collectResolvers = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const loader_utils_mjs_1 = require("./chunks/loader-utils.mjs");
require("blitz");
/**
 *
 * @param {string} src
 * @param {string} id
 * @param {string} root
 * @param {string[]} resolvers
 * @param {{resolverBasePath: string}} [options]
 * @returns {Promise<string>}
 */
async function transformBlitzRpcServer(src, id, root, resolvers, options) {
    (0, loader_utils_mjs_1.a)(id);
    (0, loader_utils_mjs_1.a)(root);
    const blitzImport = 'import { __internal_addBlitzRpcResolver } from "@blitzjs/rpc";';
    let code = blitzImport + src;
    code += "\n\n";
    for (let resolverFilePath of resolvers) {
        const relativeResolverPath = path_1.posix.relative((0, path_1.dirname)(id), (0, path_1.join)(root, resolverFilePath));
        const routePath = (0, loader_utils_mjs_1.c)(resolverFilePath, options?.resolverBasePath);
        code += `__internal_addBlitzRpcResolver('${routePath}', () => import('${relativeResolverPath}'));`;
        code += "\n";
    }
    return code;
}
exports.default = transformBlitzRpcServer;
exports.transformBlitzRpcServer = transformBlitzRpcServer;
/**
 *
 * @param {string} directory
 * @param {string[]} pageExtensions
 * @returns {Promise<string[]>}
 */
function collectResolvers(directory, pageExtensions) {
    return recursiveFindResolvers(directory, (0, loader_utils_mjs_1.b)(pageExtensions));
}
exports.collectResolvers = collectResolvers;
/**
 *
 * @param {string} dir
 * @param {RegExp} filter
 * @param {RegExp} [ignore]
 * @param {string[]} [arr]
 * @param {string} [rootDir]
 * @returns {Promise<string[]>}
 */
async function recursiveFindResolvers(dir, filter, ignore, arr = [], rootDir = dir) {
    let folders = await fs_1.promises.readdir(dir);
    if (dir === rootDir) {
        folders = folders.filter((folder) => loader_utils_mjs_1.d.includes(folder));
    }
    await Promise.all(folders.map(async (part) => {
        const absolutePath = (0, path_1.join)(dir, part);
        if (ignore && ignore.test(part))
            return;
        const pathStat = await fs_1.promises.stat(absolutePath);
        if (pathStat.isDirectory()) {
            await recursiveFindResolvers(absolutePath, filter, ignore, arr, rootDir);
            return;
        }
        if (!filter.test(part)) {
            return;
        }
        const relativeFromRoot = absolutePath.replace(rootDir, "");
        if ((0, loader_utils_mjs_1.g)(relativeFromRoot)) {
            arr.push(relativeFromRoot);
            return;
        }
    }));
    return arr.sort();
}
exports.recursiveFindResolvers = recursiveFindResolvers;
//# sourceMappingURL=blitz-loader-server.mjs.map