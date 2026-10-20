import { parseLocalDate } from './dates.js';
import { fillDeep } from './template.js';

export const MAX_PHOTOS = 12;
export const MAX_MASTERPIECES = 3;
export const MAX_FUTURE = 4;
export const PAINT_STYLES = Object.freeze(['renaissance', 'gilded', 'surreal']);
const KINDS = Object.freeze(['photo', 'masterpiece']);
const MAX_NAME_LENGTH = 40;

const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const isOptionalText = (value) => value === undefined || typeof value === 'string';

const exhibitErrors = (item, index) => {
  const label = `Exhibit ${index + 1}`;
  if (!item || typeof item !== 'object') return [`${label} must be an object.`];
  return [
    !KINDS.includes(item.kind) && `${label}: kind must be 'photo' or 'masterpiece'.`,
    !isText(item.src) && `${label}: src must point at a file, e.g. 'photos/01.jpg'.`,
    !isText(item.title) && `${label}: title cannot be empty.`,
    typeof item.note !== 'string' && `${label}: note must be text.`,
    !isOptionalText(item.date) && `${label}: date must be text.`,
    !isOptionalText(item.medium) && `${label}: medium must be text.`,
    item.style !== undefined && !PAINT_STYLES.includes(item.style) &&
      `${label}: style must be one of ${PAINT_STYLES.join(', ')}.`,
  ].filter(Boolean);
};

const collectionErrors = (exhibits) => {
  if (!Array.isArray(exhibits) || exhibits.length === 0) return ['exhibits must list at least one photo.'];
  const photos = exhibits.filter((e) => e?.kind === 'photo').length;
  const masterpieces = exhibits.filter((e) => e?.kind === 'masterpiece').length;
  return [
    photos > MAX_PHOTOS && `Gallery I has room for ${MAX_PHOTOS} photos (found ${photos}).`,
    masterpieces > MAX_MASTERPIECES && `The salon has room for ${MAX_MASTERPIECES} masterpieces (found ${masterpieces}).`,
    ...exhibits.flatMap(exhibitErrors),
  ].filter(Boolean);
};

/**
 * Check the museum config and explain every problem in plain words.
 * @param {unknown} config
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateConfig(config) {
  if (!config || typeof config !== 'object') return { ok: false, errors: ['The museum config is missing.'] };
  const c = /** @type {Record<string, any>} */ (config);
  const errors = [
    !isText(c.herName) && 'herName cannot be empty.',
    !isText(c.yourName) && 'yourName cannot be empty.',
    isText(c.herName) && c.herName.length > MAX_NAME_LENGTH && `herName must be under ${MAX_NAME_LENGTH} characters.`,
    isText(c.yourName) && c.yourName.length > MAX_NAME_LENGTH && `yourName must be under ${MAX_NAME_LENGTH} characters.`,
    !parseLocalDate(c.startDate) && 'startDate must be a real date written YYYY-MM-DD.',
    c.music !== undefined && typeof c.music !== 'string' && "music must be a file path like 'audio/song.mp3' or ''.",
    ...collectionErrors(c.exhibits),
    c.futureExhibits !== undefined &&
      (!Array.isArray(c.futureExhibits) || c.futureExhibits.length > MAX_FUTURE || !c.futureExhibits.every(isText)) &&
      `futureExhibits must be a list of up to ${MAX_FUTURE} titles.`,
    c.finalLetter !== undefined &&
      (!Array.isArray(c.finalLetter?.paragraphs) || !c.finalLetter.paragraphs.every((p) => typeof p === 'string')) &&
      'finalLetter.paragraphs must be a list of text paragraphs.',
  ].filter(Boolean);
  return { ok: errors.length === 0, errors };
}

/**
 * Fill name placeholders and split the collection into numbered photos and masterpieces.
 * Assumes the config already passed validateConfig.
 * @param {Record<string, any>} config
 */
export function prepareConfig(config) {
  const filled = fillDeep(config, { her: config.herName.trim(), me: config.yourName.trim() });
  const numbered = (exhibit, i) => ({ ...exhibit, id: `exhibit-${i + 1}`, number: i + 1 });
  const photos = filled.exhibits.filter((e) => e.kind === 'photo').map(numbered);
  const masterpieces = filled.exhibits
    .filter((e) => e.kind === 'masterpiece')
    .map((e, i) => numbered({ ...e, style: e.style ?? PAINT_STYLES[i % PAINT_STYLES.length] }, photos.length + i));
  return {
    ...filled,
    startDate: parseLocalDate(config.startDate),
    futureExhibits: filled.futureExhibits ?? [],
    photos,
    masterpieces,
    catalogue: [...photos, ...masterpieces],
  };
}
