const RADIUS_PX = 42;

/**
 * On-screen thumbstick for touch devices. The knob tracks the finger 1:1
 * (clamped to the ring) and springs home on release.
 * @param {HTMLElement} root
 */
export function createJoystick(root) {
  const knob = root.querySelector('.joystick__knob');
  let vector = { x: 0, y: 0 };
  let pointerId = null;

  const moveKnob = (dx, dy, animate) => {
    knob.style.transition = animate ? 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const track = (event) => {
    const rect = root.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const length = Math.hypot(dx, dy);
    const scale = length > RADIUS_PX ? RADIUS_PX / length : 1;
    moveKnob(dx * scale, dy * scale, false);
    vector = { x: (dx * scale) / RADIUS_PX, y: -(dy * scale) / RADIUS_PX };
  };

  const release = () => {
    pointerId = null;
    vector = { x: 0, y: 0 };
    root.classList.remove('is-active');
    moveKnob(0, 0, true);
  };

  root.addEventListener('pointerdown', (event) => {
    pointerId = event.pointerId;
    root.setPointerCapture(event.pointerId);
    root.classList.add('is-active');
    track(event);
  });
  root.addEventListener('pointermove', (event) => {
    if (event.pointerId === pointerId) track(event);
  });
  root.addEventListener('pointerup', release);
  root.addEventListener('pointercancel', release);

  return {
    get vector() {
      return vector;
    },
    show: () => {
      root.hidden = false;
    },
    hide: () => {
      root.hidden = true;
      release();
    },
  };
}
