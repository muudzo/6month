const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Create an element. Children that are not nodes are inserted as text, so
 * content from the config can never be interpreted as HTML.
 * @param {string} tag
 * @param {Record<string, any>} [props] `class`, `text`, `on<event>` handlers or attributes
 * @param {Array<Node | string | number | null | false> | Node | string} [children]
 * @returns {HTMLElement}
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = String(value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value === true ? '' : String(value));
  });
  [children].flat().forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
  return node;
}

/** Create an SVG element with attributes. */
export function svg(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  children.forEach((child) => node.append(child));
  return node;
}

const ICON_PATHS = {
  heart: 'M12 20.5C5 15.6 2.2 11.7 3.6 8 5 4.3 9.7 4.3 12 8c2.3-3.7 7-3.7 8.4 0 1.4 3.7-1.4 7.6-8.4 12.5z',
  map: 'M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5zM9 4v13.5M15 6.5V20',
  soundOn: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11',
  soundOff: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5zM16 9.5l5 5M21 9.5l-5 5',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  close: 'M6 6l12 12M18 6 6 18',
  prev: 'M14.5 6 8.5 12l6 6',
  next: 'M9.5 6l6 6-6 6',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
};

/**
 * One of the museum's line icons (decorative; label the button, not the icon).
 * @param {keyof typeof ICON_PATHS} name
 */
export function icon(name, { filled = false } = {}) {
  return svg('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' }, [
    svg('path', {
      d: ICON_PATHS[name],
      fill: filled ? 'currentColor' : 'none',
      stroke: 'currentColor',
      'stroke-width': filled ? 0 : 1.6,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }),
  ]);
}

export const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
export const isCoarsePointer = () => window.matchMedia?.('(pointer: coarse)').matches ?? false;
