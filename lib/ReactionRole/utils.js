/**
 * Serializes a function into a string wrapper.
 * @param {Function} fn
 * @returns {string}
 */
export const stringifyFunction = (fn) => `/Function(${fn.toString()})/`;

/**
 * Parses a stringified function wrapper back into a real function.
 * @param {string} str
 * @returns {Function}
 */
export const parseFunction = (str) => {
  const value = str.slice(10, -2);
  // Wrap in parentheses so that eval returns the function object
  return eval(`(${value})`);
};
