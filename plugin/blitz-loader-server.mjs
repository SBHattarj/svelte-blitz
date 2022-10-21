import { posix, dirname, join } from 'path';
import { promises } from 'fs';
import { b as buildPageExtensionRegex, a as assertPosixPath, c as convertPageFilePathToRoutePath, d as topLevelFoldersThatMayContainResolvers, g as getIsRpcFile } from './chunks/loader-utils.mjs';
import 'blitz';
/**
 *
 * @param {string} src
 * @param {string} id
 * @param {string} root
 * @param {string[]} resolvers
 * @param {{resolverBasePath: string}} [options]
 * @returns {Promise<string>}
 */
export default async function transformBlitzRpcServer(src, id, root, resolvers, options) {
    assertPosixPath(id);
    assertPosixPath(root);
    const blitzImport = 'import { __internal_addBlitzRpcResolver } from "@blitzjs/rpc";';
    let code = blitzImport + src;
    code += "\n\n";
    for (let resolverFilePath of resolvers) {
        const relativeResolverPath = posix.relative(dirname(id), join(root, resolverFilePath));
        const routePath = convertPageFilePathToRoutePath(resolverFilePath, options?.resolverBasePath);
        code += `__internal_addBlitzRpcResolver('${routePath}', () => import('${relativeResolverPath}'));`;
        code += "\n";
    }
    return code;
}
/**
 *
 * @param {string} directory
 * @param {string[]} pageExtensions
 * @returns {Promise<string[]>}
 */
function collectResolvers(directory, pageExtensions) {
    return recursiveFindResolvers(directory, buildPageExtensionRegex(pageExtensions));
}
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
    let folders = await promises.readdir(dir);
    if (dir === rootDir) {
        folders = folders.filter((folder) => topLevelFoldersThatMayContainResolvers.includes(folder));
    }
    await Promise.all(folders.map(async (part) => {
        const absolutePath = join(dir, part);
        if (ignore && ignore.test(part))
            return;
        const pathStat = await promises.stat(absolutePath);
        if (pathStat.isDirectory()) {
            await recursiveFindResolvers(absolutePath, filter, ignore, arr, rootDir);
            return;
        }
        if (!filter.test(part)) {
            return;
        }
        const relativeFromRoot = absolutePath.replace(rootDir, "");
        if (getIsRpcFile(relativeFromRoot)) {
            arr.push(relativeFromRoot);
            return;
        }
    }));
    return arr.sort();
}
export { collectResolvers, recursiveFindResolvers, transformBlitzRpcServer };
//# sourceMappingURL=blitz-loader-server.mjs.map