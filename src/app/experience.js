import * as THREE from 'three';
import { HEARTS, roomAt, viewPointFor } from '../lib/layout.js';
import { collectHeart, loadVisit, markRenewed, markSeen, saveVisit } from '../lib/visit.js';
import { createInteraction } from '../controls/interaction.js';
import { createPlayer } from '../controls/player.js';
import { createAudio } from '../ui/audio.js';
import { createConfetti } from '../ui/confetti.js';
import { couponContent } from '../ui/coupon.js';
import { isCoarsePointer, prefersReducedMotion } from '../ui/dom.js';
import { createHud } from '../ui/hud.js';
import { createJoystick } from '../ui/joystick.js';
import { letterContent } from '../ui/letter.js';
import { guideContent } from '../ui/guide.js';
import { createModal } from '../ui/modal.js';
import { createPlacard } from '../ui/placard.js';
import { planContent } from '../ui/plan.js';
import { showTicket } from '../ui/ticket.js';
import { OUTSIDE_POSE, startIntro } from './intro.js';
import { promptFor } from './prompts.js';

const SOUND_KEY = 'museum-of-us:sound';
const CURTAIN_MS = 380;
const PLACARD_WIDTH = 410;

const byId = (id) => document.getElementById(id);
const safeStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

const readSoundPreference = (storage) => {
  try {
    return storage?.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
};

/** Must match the placard's max-height on phones (placard.css). */
const SHEET_FRACTION = 0.48;
const isSheetLayout = () => window.matchMedia('(max-width: 760px)').matches;
const hudBottom = () => {
  const hud = byId('hud');
  return hud.hidden ? 0 : hud.getBoundingClientRect().bottom;
};

/** Fraction of the screen left for the artwork once the placard is open. */
const visibleArea = () => {
  if (isSheetLayout()) {
    const free = window.innerHeight * (1 - SHEET_FRACTION) - hudBottom();
    return { availWidth: 1, availHeight: Math.max(0.2, free / window.innerHeight) };
  }
  const covered = Math.min(PLACARD_WIDTH, window.innerWidth * 0.42) + 40;
  return { availWidth: 1 - covered / window.innerWidth, availHeight: 1 };
};

/** Pixels to slide the scene so the artwork sits in the space the placard leaves. */
const viewShiftFor = (footprint) => {
  if (footprint.bottom > 0) return { x: 0, y: (footprint.bottom - hudBottom()) / 2 };
  return { x: footprint.right / 2, y: 0 };
};

/**
 * Everything that happens once the museum is built: the ticket, the walk in,
 * looking at art, hidden hearts and the letter at the end.
 * @param {{ stage: ReturnType<typeof import('../world/stage.js').createStage>, world: Awaited<ReturnType<typeof import('../world/world.js').createWorld>>, museum: Record<string, any> }} options
 */
export function startExperience({ stage, world, museum }) {
  const storage = safeStorage();
  const reducedMotion = prefersReducedMotion();
  const coarse = isCoarsePointer();
  let visit = loadVisit(storage);
  let intro = null;

  const audio = createAudio({
    musicUrl: museum.music ? `${import.meta.env.BASE_URL}${museum.music.replace(/^\/+/, '')}` : '',
    enabled: readSoundPreference(storage),
  });
  const confetti = createConfetti(byId('confetti'));
  const joystick = createJoystick(byId('joystick'));
  const modal = createModal(byId('modal'));
  const placard = createPlacard(byId('placard'), museum);
  const curtain = byId('curtain');

  const save = (next) => {
    visit = next;
    saveVisit(storage, visit);
    hud.setTally({ seenCount: visit.seen.length, total: world.tour.length, heartCount: visit.hearts.length, heartTotal: HEARTS.length });
  };

  const teleport = (swap) => {
    curtain.classList.add('is-down');
    window.setTimeout(() => {
      swap();
      curtain.classList.remove('is-down');
    }, CURTAIN_MS);
  };

  const closePlacard = () => {
    placard.close();
    player.release();
  };

  const openLetter = () => {
    audio.play('chime');
    modal.open({
      label: 'A letter for you',
      panelClass: 'letter',
      closeLabel: 'Fold the letter away',
      content: letterContent(museum, {
        alreadyRenewed: visit.renewed,
        onRenew: () => {
          save(markRenewed(visit));
          audio.play('fanfare');
          confetti.burst();
        },
      }),
    });
  };

  const focusOn = (item, { onArrive } = {}) => {
    const view = viewPointFor(item.slot, item.size, { fovDeg: stage.camera.fov, aspect: stage.camera.aspect, ...visibleArea() });
    player.glideTo({ x: view.x, z: view.z, y: view.y, lookAt: item.slot.position }, { nextMode: 'focus', onArrive });
  };

  const showExhibit = (item) => {
    const index = world.tour.indexOf(item);
    const inTour = index >= 0;
    const step = (delta) => () => showExhibit(world.tour[(index + delta + world.tour.length) % world.tour.length]);
    focusOn(item);
    placard.open(item, {
      position: index + 1,
      total: world.tour.length,
      onPrev: inTour ? step(-1) : undefined,
      onNext: inTour ? step(1) : undefined,
      onClose: closePlacard,
    });
    audio.play('chime');
    if (!inTour) return;
    const before = visit.seen.length;
    save(markSeen(visit, item.id));
    const sawEverything = visit.seen.length === world.tour.length && before < world.tour.length;
    if (sawEverything) hud.toast('You have seen the whole collection. Something is waiting in the Future Wing.');
  };

  const findHeart = (item) => {
    world.hearts.collect(item.id);
    interaction.disable(item.id);
    save(collectHeart(visit, item.id));
    audio.play('sparkle');
    hud.bumpHearts();
    const found = visit.hearts.length;
    if (found < HEARTS.length) {
      hud.toast(`A hidden heart, one for month ${item.data.month}. ${found} of ${HEARTS.length} found.`);
      return;
    }
    audio.play('fanfare');
    confetti.burst({ count: 120 });
    modal.open({ label: 'Every heart found', panelClass: 'coupon', content: couponContent(museum) });
  };

  const activate = (item) => {
    if (item.kind === 'heart') findHeart(item);
    else if (item.kind === 'finale') {
      if (placard.isOpen) placard.close();
      focusOn(item, { onArrive: openLetter });
    } else showExhibit(item);
  };

  const welcomeHint = () =>
    coarse
      ? `Welcome, ${museum.herName}. Drag to look around, use the stick to walk, and tap any picture.`
      : `Welcome, ${museum.herName}. Drag to look, walk with W A S D, and click any picture.`;

  /** The guide's speech in the lobby. It ends by starting the tour, or by letting her wander. */
  const openGuide = () => {
    let beginTour = false;
    audio.play('chime');
    modal.open({
      label: `A welcome from ${museum.guide.name ?? 'your guide'}`,
      panelClass: 'guide',
      closeLabel: 'Skip the welcome',
      content: guideContent(museum.guide, {
        onBegin: () => {
          beginTour = true;
          modal.close();
        },
        onWander: () => modal.close(),
      }),
      onClose: () => (beginTour ? showExhibit(world.tour[0]) : hud.toast(welcomeHint())),
    });
  };

  const openPlan = () => {
    modal.open({
      label: 'Floor plan',
      panelClass: 'plan',
      content: planContent({
        tour: world.tour,
        seen: visit.seen,
        pose: player.pose,
        onGo: (item) => {
          modal.close();
          showExhibit(item);
        },
      }),
    });
  };

  const player = createPlayer({
    camera: stage.camera,
    surface: stage.canvas,
    joystick,
    reducedMotion,
    isInputBlocked: () => modal.isOpen,
    onTeleport: teleport,
    onInterrupt: () => placard.close(),
    onHover: (x, y) => {
      if (!modal.isOpen && player.mode !== 'locked') interaction.hover(x, y);
    },
    onTap: (x, y) => {
      if (modal.isOpen || player.mode === 'locked') return;
      const item = interaction.pick(x, y);
      if (item) activate(item);
      else if (placard.isOpen) closePlacard();
    },
  });
  player.setPose(OUTSIDE_POSE);

  const interaction = createInteraction({
    camera: stage.camera,
    surface: stage.canvas,
    interactables: world.interactables,
    occluders: world.occluders,
  });
  visit.hearts.forEach((id) => {
    world.hearts.collect(id);
    interaction.disable(id);
  });

  const hud = createHud(
    { hud: byId('hud'), prompt: byId('prompt'), toast: byId('toast') },
    {
      museumName: museum.museumName,
      soundOn: audio.enabled,
      onMap: openPlan,
      onSound: (on) => {
        audio.setEnabled(on);
        try {
          storage?.setItem(SOUND_KEY, on ? 'on' : 'off');
        } catch {
          /* Preference just won't be remembered. */
        }
      },
    },
  );
  save(visit);

  window.addEventListener('keydown', (event) => {
    if (modal.isOpen || player.mode === 'locked') return;
    if (event.key === 'Escape' && placard.isOpen) closePlacard();
    if (event.key === 'Enter' && !placard.isOpen && document.activeElement === document.body) {
      const item = interaction.probe(1);
      if (item) activate(item);
    }
    if (event.key.toLowerCase() === 'm' && !event.metaKey && !event.ctrlKey) openPlan();
  });
  document.addEventListener('visibilitychange', () => audio.setSuspended(document.hidden));

  const enter = () => {
    hud.show();
    if (coarse) joystick.show();
    intro = startIntro({
      player,
      setDoorsOpen: world.setDoorsOpen,
      playDoors: () => audio.play('doors'),
      reducedMotion,
      onInside: () => {
        if (museum.guide) openGuide();
        else hud.toast(welcomeHint());
        if (import.meta.env.DEV && world.missingPhotos > 0) {
          console.info(`[museum] ${world.missingPhotos} exhibits are still showing placeholders. Add photos to /public/photos.`);
        }
      },
    });
  };

  showTicket(byId('entrance'), museum, {
    onTear: () => {
      audio.start();
      audio.play('tear');
    },
  }).then(enter);

  if (import.meta.env.DEV || new URLSearchParams(window.location.search).has('debug')) {
    window.__museum = { player, world, showExhibit, openPlan, openLetter, openGuide, activate, get visit() { return visit; } };
  }

  const clock = new THREE.Clock();
  const frame = () => {
    const dt = Math.min(clock.getDelta(), 1 / 20);
    const t = clock.elapsedTime;
    if (player.mode === 'locked') player.setPose({ yaw: OUTSIDE_POSE.yaw + Math.sin(t * 0.15) * 0.05 });
    intro?.update(t);
    player.update(dt);
    world.update(t, dt, player.pose);
    const busy = modal.isOpen || placard.isOpen || player.mode === 'glide' || player.mode === 'locked';
    hud.setPrompt(busy ? '' : promptFor(interaction.probe(dt), coarse));
    hud.setRoom(roomAt(player.pose.x, player.pose.z)?.name);
    const shift = placard.isOpen ? viewShiftFor(placard.footprint()) : { x: 0, y: 0 };
    stage.setViewShift(shift.x, shift.y);
    stage.render(world.scene, dt);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
