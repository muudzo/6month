const TOKEN = /\{(\w+)\}/g;

/**
 * Replace `{token}` placeholders with values; unknown tokens are kept as-is.
 * @template T
 * @param {T} value
 * @param {Record<string, string>} vars
 * @returns {T}
 */
export function fillTemplate(value, vars) {
  if (typeof value !== 'string') return value;
  return /** @type {T} */ (
    value.replace(TOKEN, (whole, key) => (Object.hasOwn(vars, key) ? vars[key] : whole))
  );
}

/**
 * Return a deep copy of plain data with every string templated.
 * @param {unknown} value
 * @param {Record<string, string>} vars
 * @returns {any}
 */
export function fillDeep(value, vars) {
  if (Array.isArray(value)) return value.map((item) => fillDeep(item, vars));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fillDeep(item, vars)]));
  }
  return fillTemplate(value, vars);
}
