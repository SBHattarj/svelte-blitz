"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = exports.g = exports.f = exports.e = exports.d = exports.c = exports.b = exports.a = void 0;
const blitz_1 = require("blitz");
const path_1 = require("path");
/**
 *
 * @param {string} path
 */
function assertPosixPath(path) {
    const errMsg = `Wrongly formatted path: ${path}`;
    (0, blitz_1.assert)(!path.includes(path_1.win32.sep), errMsg);
}
exports.a = assertPosixPath;
/**
 *
 * @param {string} path
 * @returns
 */
function toPosixPath(path) {
    if (process.platform !== 'win32') {
        (0, blitz_1.assert)(path_1.sep === path_1.posix.sep, 'TODO');
        assertPosixPath(path);
        return path;
    }
    else {
        (0, blitz_1.assert)(path_1.sep === path_1.win32.sep, 'TODO');
        const pathPosix = path.split(path_1.win32.sep).join(path_1.posix.sep);
        assertPosixPath(pathPosix);
        return pathPosix;
    }
}
exports.t = toPosixPath;
const topLevelFoldersThatMayContainResolvers = ['src', 'app', 'integrations'];
exports.d = topLevelFoldersThatMayContainResolvers;
/**
 *
 * @param {string[]} pageExtensions
 * @returns
 */
function buildPageExtensionRegex(pageExtensions) {
    return new RegExp(`(?<!\\.test|\\.spec)\\.(?:${pageExtensions.join('|')})$`);
}
exports.b = buildPageExtensionRegex;
const fileExtensionRegex = /\.([a-z]+)$/;
/**
 *
 * @param {string} filePath
 * @param {string} [resolverBasePath]
 * @returns
 */
function convertPageFilePathToRoutePath(filePath, resolverBasePath) {
    if (resolverBasePath === 'root') {
        return filePath.replace(fileExtensionRegex, '');
    }
    return filePath
        .replace(/^.*?[\\/]queries[\\/]/, '/')
        .replace(/^.*?[\\/]mutations[\\/]/, '/')
        .replace(fileExtensionRegex, '');
}
exports.c = convertPageFilePathToRoutePath;
/**
 *
 * @param {string} filePathFromAppRoot
 * @returns
 */
function convertFilePathToResolverName(filePathFromAppRoot) {
    return filePathFromAppRoot
        .replace(/^.*[\\/](queries|mutations)[\\/]/, '')
        .replace(fileExtensionRegex, '');
}
exports.e = convertFilePathToResolverName;
/**
 *
 * @param {string} filePathFromAppRoot
 * @returns
 */
function convertFilePathToResolverType(filePathFromAppRoot) {
    return filePathFromAppRoot.match(/[\\/]queries[\\/]/) ? 'query' : 'mutation';
}
exports.f = convertFilePathToResolverType;
/**
 *
 * @param {string} filePathFromAppRoot
 * @returns
 */
function getIsRpcFile(filePathFromAppRoot) {
    return (/[\\/]queries[\\/]/.test(filePathFromAppRoot) || /[\\/]mutations[\\/]/.test(filePathFromAppRoot));
}
exports.g = getIsRpcFile;
//# sourceMappingURL=loader-utils.mjs.map