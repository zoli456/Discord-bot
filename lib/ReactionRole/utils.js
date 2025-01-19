"use strict";
// special thanks to https://stackoverflow.com/a/36517369/10124281
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFunction = exports.stringifyFunction = void 0;
const stringifyFunction = (fn) => `/Function(${fn.toString()})/`;
exports.stringifyFunction = stringifyFunction;
const parseFunction = (str) => {
    const value = str.substring(10, str.length - 2);
    return (0, eval)("(" + value + ")");
};
exports.parseFunction = parseFunction;
