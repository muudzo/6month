const STORAGE_KEY = 'museum-of-us:visit';

/** @typedef {{ seen: string[], hearts: string[], renewed: boolean }} Visit */

/** @returns {Visit} */
export function emptyVisit() {
  return { seen: [], hearts: [], renewed: false };
}

const addOnce = (list, id) => (list.includes(id) ? list : [...list, id]);

/** @param {Visit} visit @param {string} id @returns {Visit} */
export function markSeen(visit, id) {
  const seen = addOnce(visit.seen, id);
  return seen === visit.seen ? visit : { ...visit, seen };
}

/** @param {Visit} visit @param {string} id @returns {Visit} */
export function collectHeart(visit, id) {
  const hearts = addOnce(visit.hearts, id);
  return hearts === visit.hearts ? visit : { ...visit, hearts };
}

/** @param {Visit} visit @returns {Visit} */
export function markRenewed(visit) {
  return visit.renewed ? visit : { ...visit, renewed: true };
}

const isStringList = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string');

/**
 * Read the visitor's progress. Storage can be missing, blocked or corrupt;
 * every one of those cases starts a fresh visit.
 * @param {Pick<Storage, 'getItem'> | undefined} storage
 * @returns {Visit}
 */
export function loadVisit(storage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return emptyVisit();
    const parsed = JSON.parse(raw);
    if (!isStringList(parsed?.seen) || !isStringList(parsed?.hearts)) return emptyVisit();
    return { seen: parsed.seen, hearts: parsed.hearts, renewed: parsed.renewed === true };
  } catch {
    return emptyVisit();
  }
}

/**
 * Best-effort save; progress is a convenience, so failures are ignored.
 * @param {Pick<Storage, 'setItem'> | undefined} storage
 * @param {Visit} visit
 */
export function saveVisit(storage, visit) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(visit));
  } catch {
    /* Private browsing or blocked storage: the visit still works, it just won't be remembered. */
  }
}
