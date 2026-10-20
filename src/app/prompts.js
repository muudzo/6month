/**
 * The hint shown at the bottom of the screen for whatever is in front of the visitor.
 * @param {{ kind: string } | null} item
 * @param {boolean} touch
 * @returns {string}
 */
export function promptFor(item, touch) {
  if (!item) return '';
  const act = touch ? 'Tap' : 'Click';
  switch (item.kind) {
    case 'heart':
      return `A hidden heart. ${act} it to keep it`;
    case 'finale':
      return `A sealed letter. ${act} to open it`;
    case 'sculpture':
      return `${act} the sculpture to read about it`;
    case 'future':
      return `${act} the empty frame`;
    default:
      return touch ? 'Tap the picture to read its story' : 'Click the picture, or press Enter, to read its story';
  }
}
