import { DOORS, OBSTACLES, PLAYER_RADIUS, isWalkable } from './layout.js';

const SAMPLE_STEP = 0.2;
const DOOR_APPROACH = 1.2;
const CORNER_CLEARANCE = PLAYER_RADIUS + 0.35;

const distance = (a, b) => Math.hypot(b.x - a.x, b.z - a.z);

/**
 * True when a visitor can walk the straight line between two points.
 * @param {{ x: number, z: number }} a
 * @param {{ x: number, z: number }} b
 * @returns {boolean}
 */
export function segmentClear(a, b) {
  const steps = Math.max(1, Math.ceil(distance(a, b) / SAMPLE_STEP));
  return Array.from({ length: steps + 1 }, (_, i) => i / steps).every((t) =>
    isWalkable(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t),
  );
}

/**
 * @param {Array<{ x: number, z: number }>} path
 * @returns {number}
 */
export function pathLength(path) {
  return path.slice(1).reduce((sum, point, i) => sum + distance(path[i], point), 0);
}

const buildWaypoints = () => {
  const doorPoints = DOORS.flatMap((door) => [
    { x: door.x, z: door.z1 + DOOR_APPROACH },
    { x: door.x, z: door.z0 - DOOR_APPROACH },
  ]);
  const corners = OBSTACLES.flatMap((o) => [
    { x: o.x0 - CORNER_CLEARANCE, z: o.z0 - CORNER_CLEARANCE },
    { x: o.x1 + CORNER_CLEARANCE, z: o.z0 - CORNER_CLEARANCE },
    { x: o.x0 - CORNER_CLEARANCE, z: o.z1 + CORNER_CLEARANCE },
    { x: o.x1 + CORNER_CLEARANCE, z: o.z1 + CORNER_CLEARANCE },
  ]);
  return [...doorPoints, ...corners].filter((p) => isWalkable(p.x, p.z));
};

let cachedGraph = null;

const baseGraph = () => {
  if (cachedGraph) return cachedGraph;
  const nodes = buildWaypoints();
  const edges = nodes.map((a, i) =>
    nodes.flatMap((b, j) => (i !== j && segmentClear(a, b) ? [{ to: j, cost: distance(a, b) }] : [])),
  );
  cachedGraph = { nodes, edges };
  return cachedGraph;
};

const dijkstra = (nodes, edgesOf, source, target) => {
  const dist = nodes.map(() => Infinity);
  const prev = nodes.map(() => -1);
  const done = nodes.map(() => false);
  dist[source] = 0;
  for (let round = 0; round < nodes.length; round += 1) {
    let current = -1;
    dist.forEach((d, i) => {
      if (!done[i] && d < Infinity && (current === -1 || d < dist[current])) current = i;
    });
    if (current === -1 || current === target) break;
    done[current] = true;
    edgesOf(current).forEach(({ to, cost }) => {
      if (dist[current] + cost < dist[to]) {
        dist[to] = dist[current] + cost;
        prev[to] = current;
      }
    });
  }
  if (dist[target] === Infinity) return null;
  const order = [];
  for (let at = target; at !== -1; at = prev[at]) order.unshift(at);
  return order;
};

/**
 * Shortest walkable route between two points through doors and around obstacles.
 * @param {{ x: number, z: number }} from
 * @param {{ x: number, z: number }} to
 * @returns {Array<{ x: number, z: number }> | null}
 */
export function findPath(from, to) {
  if (!isWalkable(to.x, to.z)) return null;
  if (segmentClear(from, to)) return [{ ...from }, { ...to }];

  const graph = baseGraph();
  const start = graph.nodes.length;
  const goal = start + 1;
  const nodes = [...graph.nodes, from, to];
  const link = (point) =>
    graph.nodes.flatMap((node, j) => (segmentClear(point, node) ? [{ to: j, cost: distance(point, node) }] : []));
  const fromLinks = link(from);
  const goalLinks = link(to);

  const edgesOf = (i) => {
    if (i === start) return fromLinks;
    if (i === goal) return [];
    const base = graph.edges[i];
    const toGoal = goalLinks.find((edge) => edge.to === i);
    return toGoal ? [...base, { to: goal, cost: toGoal.cost }] : base;
  };

  const order = dijkstra(nodes, edgesOf, start, goal);
  return order ? order.map((i) => ({ x: nodes[i].x, z: nodes[i].z })) : null;
}
