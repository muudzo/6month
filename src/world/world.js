import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BENCHES, gallerySlots, masterpieceSlots } from '../lib/layout.js';
import { buildArchitecture } from './architecture.js';
import { buildDust, buildHearts } from './collectibles.js';
import { buildMasterpiece, buildPhotoExhibit, salonSigns } from './exhibits.js';
import { buildExterior } from './exterior.js';
import { bench, chandelier } from './furniture.js';
import { centerpieceWall, finale, futureFrames, lobbySigns, sculpture, wallTexts } from './installations.js';
import { buildLighting } from './lighting.js';
import { createMaterials } from './materials.js';
import { loadPhoto } from './photos.js';
import { setMaxAnisotropy } from './textures.js';

const SALON_DUST = Object.freeze({ x0: -11, x1: 11, y0: 0.3, y1: 10, z0: -63, z1: -39 });

const loadAllPhotos = (catalogue, onProgress) => {
  let done = 0;
  return Promise.all(
    catalogue.map((exhibit, i) =>
      loadPhoto(exhibit, i).then((photo) => {
        done += 1;
        onProgress(done / catalogue.length);
        return photo;
      }),
    ),
  );
};

const furnish = (scene, materials) => {
  BENCHES.forEach(({ x, z }) => scene.add(bench(materials, { x, z })));
  scene.add(chandelier(materials, { x: 0, y: 5.4, z: 7, ceilingY: 8, scale: 1.1 }));
  scene.add(chandelier(materials, { x: 0, y: 7.6, z: -45.5, ceilingY: 11.9, scale: 1.6 }));
  scene.add(lobbySigns(materials), salonSigns(materials));
};

/**
 * Build the whole museum. Resolves once every photo is loaded and painted.
 * @param {{ renderer: THREE.WebGLRenderer, museum: ReturnType<typeof import('../lib/config.js').prepareConfig>, onProgress: (fraction: number) => void }} options
 */
export async function createWorld({ renderer, museum, onProgress }) {
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  setMaxAnisotropy(anisotropy);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05060c');
  scene.fog = new THREE.FogExp2('#0c0907', 0.011);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();

  const materials = createMaterials();
  const architecture = buildArchitecture(materials);
  scene.add(architecture);
  const exterior = buildExterior(materials, museum);
  scene.add(exterior.group);
  const freestandingWall = centerpieceWall(materials);
  scene.add(freestandingWall);
  const texts = wallTexts(materials, museum);
  scene.add(texts.group);
  furnish(scene, materials);

  const photoSlots = gallerySlots(museum.photos.length);
  const paintingSlots = masterpieceSlots(museum.masterpieces.length);
  scene.add(buildLighting(paintingSlots));

  const photos = await loadAllPhotos(museum.catalogue, onProgress);
  const photoExhibits = museum.photos.map((exhibit, i) =>
    buildPhotoExhibit({ exhibit, slot: photoSlots[i], photo: photos[i], index: i, materials, anisotropy }),
  );
  const paintings = museum.masterpieces.map((exhibit, i) =>
    buildMasterpiece({
      exhibit,
      slot: paintingSlots[i],
      slotIndex: i,
      photo: photos[museum.photos.length + i],
      renderer,
      materials,
      anisotropy,
    }),
  );
  const lobbySculpture = sculpture(materials, museum);
  const reserved = futureFrames(materials, museum.futureExhibits);
  const letter = finale(materials);
  const hearts = buildHearts(materials);
  const dust = buildDust(SALON_DUST, 450);

  const tour = [...photoExhibits, ...paintings];
  const placed = [...tour, lobbySculpture, ...reserved, letter];
  placed.forEach((item) => {
    scene.add(item.object);
    if (item.extras) scene.add(item.extras);
  });
  scene.add(hearts.group, dust.points);
  const interactables = [...placed, ...hearts.items];

  return {
    scene,
    tour,
    interactables,
    occluders: [architecture, exterior.group, freestandingWall],
    hearts,
    missingPhotos: tour.filter((item) => item.isPlaceholder).length,
    setDoorsOpen: exterior.setDoorsOpen,
    update: (t, dt) => {
      texts.tick(new Date());
      lobbySculpture.update(t);
      letter.update(t);
      hearts.update(t);
      dust.update(t, dt);
    },
  };
}
