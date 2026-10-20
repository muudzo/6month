import { el, icon } from './dom.js';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A single modal layer with focus trapping, Escape to close and focus restore.
 * @param {HTMLElement} root
 */
export function createModal(root) {
  let onCloseHandler = null;
  let returnFocus = null;

  /** Escape and the Tab trap work wherever focus is, even if it fell back to <body>. */
  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...root.querySelectorAll(FOCUSABLE)];
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const outside = !root.contains(document.activeElement);
    if (event.shiftKey && (outside || document.activeElement === first)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (outside || document.activeElement === last)) {
      event.preventDefault();
      first.focus();
    }
  };

  const close = () => {
    if (root.hidden) return;
    root.hidden = true;
    root.replaceChildren();
    document.removeEventListener('keydown', onKeyDown, true);
    const handler = onCloseHandler;
    onCloseHandler = null;
    returnFocus?.focus?.({ preventScroll: true });
    returnFocus = null;
    handler?.();
  };

  root.addEventListener('click', (event) => {
    if (event.target === root) close();
  });

  /**
   * @param {{ label: string, panelClass: string, content: Node[], onClose?: () => void, closeLabel?: string }} options
   */
  const open = ({ label, panelClass, content, onClose, closeLabel = 'Close' }) => {
    if (root.hidden) {
      returnFocus = document.activeElement;
      document.addEventListener('keydown', onKeyDown, true);
    }
    onCloseHandler = onClose ?? null;
    const closeButton = el('button', { class: 'icon-btn modal__close', type: 'button', 'aria-label': closeLabel, onclick: close }, [icon('close')]);
    const panel = el('div', { class: `modal__panel ${panelClass}` }, [closeButton, ...content]);
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', label);
    root.replaceChildren(panel);
    root.hidden = false;
    const preferred = panel.querySelector('[data-autofocus]') ?? closeButton;
    preferred.focus({ preventScroll: true });
  };

  return {
    open,
    close,
    get isOpen() {
      return !root.hidden;
    },
  };
}
