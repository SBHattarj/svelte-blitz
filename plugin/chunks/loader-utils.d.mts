/**
 *
 * @param {string} path
 */
declare function assertPosixPath(path: string): void;
/**
 *
 * @param {string[]} pageExtensions
 * @returns
 */
declare function buildPageExtensionRegex(pageExtensions: string[]): RegExp;
/**
 *
 * @param {string} filePath
 * @param {string} [resolverBasePath]
 * @returns
 */
declare function convertPageFilePathToRoutePath(filePath: string, resolverBasePath?: string | undefined): string;
declare const topLevelFoldersThatMayContainResolvers: string[];
/**
 *
 * @param {string} filePathFromAppRoot
 * @returns
 */
declare function convertFilePathToResolverName(filePathFromAppRoot: string): string;
/**
 *
 * @param {string} filePathFromAppRoot
 * @returns
 */
declare function convertFilePathToResolverType(filePathFromAppRoot: string): "query" | "mutation";
/**
 *
 * @param {string} filePathFromAppRoot
 * @returns
 */
declare function getIsRpcFile(filePathFromAppRoot: string): boolean;
/**
 *
 * @param {string} path
 * @returns
 */
declare function toPosixPath(path: string): string;
export { assertPosixPath as a, buildPageExtensionRegex as b, convertPageFilePathToRoutePath as c, topLevelFoldersThatMayContainResolvers as d, convertFilePathToResolverName as e, convertFilePathToResolverType as f, getIsRpcFile as g, toPosixPath as t };
