import { HEARTS } from '../lib/layout.js';
import { el, icon } from './dom.js';

/**
 * The reward for finding every hidden heart.
 * @param {{ secretNote: string }} museum
 * @returns {Node[]}
 */
export function couponContent(museum) {
  return [
    el('div', { class: 'coupon__hearts', 'aria-hidden': 'true' }, HEARTS.map((_, i) => {
      const heart = icon('heart', { filled: true });
      heart.style.animationDelay = `${i * 90}ms`;
      return heart;
    })),
    el('p', { class: 'eyebrow', text: `${HEARTS.length} of ${HEARTS.length} hidden hearts found` }),
    el('h2', { class: 'coupon__title', text: 'A voucher, redeemable in person' }),
    el('p', { class: 'coupon__note', text: museum.secretNote }),
    el('span', { class: 'coupon__stamp', text: 'Valid forever' }),
  ];
}
