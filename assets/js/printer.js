// beluci — live "3D printer" hero: a spiral-vase toolpath printed layer by layer
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

const host = document.getElementById("printer");
if (host) init();

function init() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const root = new THREE.Group();
  scene.add(root);

  // ── build plate ──
  const plate = new THREE.Group();
  const grid = new THREE.GridHelper(4.4, 22, 0x2a2a30, 0x1a1a1f);
  grid.material.transparent = true; grid.material.opacity = 0.9;
  plate.add(grid);
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(4.4, 0.06, 4.4)),
    new THREE.LineBasicMaterial({ color: 0x3a3a42 })
  );
  edge.position.y = -0.03; plate.add(edge);
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(1.6, 64),
    new THREE.MeshBasicMaterial({ color: 0xc6f432, transparent: true, opacity: 0.035, depthWrite: false })
  );
  glow.rotation.x = -Math.PI / 2; glow.position.y = 0.002; plate.add(glow);
  root.add(plate);

  // ── shapes (radius as function of angle + height) ──
  const SHAPES = [
    { name: "PETG", temp: 240, layers: 120, h: 2.6, r: (a, z) => (0.95 + 0.28 * Math.sin(z * Math.PI * 0.95)) * (1 + 0.09 * Math.sin(7 * a + z * 3.2)) },
    { name: "PLA", temp: 215, layers: 110, h: 2.3, r: (a, z) => { const t = Math.pow(Math.max(0, Math.sin(10 * a + z * 1.6)), 6); return (1.05 - 0.18 * z / 2.3) * (0.86 + 0.16 * t); } },
    { name: "PLA+", temp: 220, layers: 120, h: 2.5, r: (a, z) => { const k = 6, sec = Math.cos(Math.PI / k) / Math.cos(((a + z * 0.55) % (2 * Math.PI / k)) - Math.PI / k); return (0.78 + 0.32 * Math.sin(z * 1.25)) * sec; } },
  ];
  const SEG = 150;
  const C_BASE = new THREE.Color(0x2a3610), C_TOP = new THREE.Color(0xc6f432), C_HOT = new THREE.Color(0xf0ffc8);

  let line, geo, mat, pts = 0, shapeIx = 0, shape;
  const nozzle = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 24), new THREE.MeshBasicMaterial({ color: 0xd8d8de }));
  cone.rotation.x = Math.PI; cone.position.y = 0.13; nozzle.add(cone);
  const block = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.42), new THREE.MeshBasicMaterial({ color: 0x1d1d22 }));
  block.position.y = 0.39; nozzle.add(block);
  const blockEdge = new THREE.LineSegments(new THREE.EdgesGeometry(block.geometry), new THREE.LineBasicMaterial({ color: 0x55555f }));
  blockEdge.position.copy(block.position); nozzle.add(blockEdge);
  const tip = new THREE.PointLight(0xd6ff5a, 2, 1.5); nozzle.add(tip);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), new THREE.MeshBasicMaterial({ color: 0xf4ffd6 }));
  nozzle.add(spark);
  root.add(nozzle);

  const hud = {
    layer: document.getElementById("hud-layer"), total: document.getElementById("hud-total"),
    z: document.getElementById("hud-z"), bar: document.getElementById("hud-bar"),
    mat: document.getElementById("hud-mat"), temp: document.getElementById("hud-temp"),
  };

  let positions = [];
  function build(ix) {
    shape = SHAPES[ix % SHAPES.length];
    if (line) { root.remove(line); geo.dispose(); }
    positions = []; const colors = [];
    const N = shape.layers * SEG;
    for (let i = 0; i <= N; i++) {
      const a = (i / SEG) * Math.PI * 2;
      const z = (i / N) * shape.h;
      const r = shape.r(a % (Math.PI * 2), z);
      positions.push(Math.cos(a) * r, z, Math.sin(a) * r);
      const c = C_BASE.clone().lerp(C_TOP, Math.pow(i / N, 0.7));
      // fake lighting: side facing the light is bright, back side dark -> real 3D look with visible layers
      const lit = 0.32 + 0.68 * Math.pow(0.5 + 0.5 * Math.cos(a - 0.9), 1.6);
      const ridge = (i % SEG) % 2 ? 1 : 0.92;
      c.multiplyScalar(lit * ridge);
      colors.push(c.r, c.g, c.b);
    }
    geo = new LineGeometry();
    geo.setPositions(positions); geo.setColors(colors);
    mat = mat || new LineMaterial({ vertexColors: true, linewidth: 1.7, worldUnits: false, transparent: true, opacity: 1 });
    mat.opacity = 1;
    line = new Line2(geo, mat);
    root.add(line);
    pts = 0;
    hud.total && (hud.total.textContent = String(shape.layers).padStart(3, "0"));
    hud.mat && (hud.mat.textContent = shape.name);
    hud.temp && (hud.temp.textContent = shape.temp);
  }
  build(0);

  // ── sizing ──
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    mat.resolution.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  }
  new ResizeObserver(resize).observe(host); resize();

  // ── interaction ──
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener("pointermove", (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });

  // ── loop ──
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(host);
  const total = () => shape.layers * SEG;
  let phase = "print", hold = 0, last = performance.now(), angle = 0.6;
  const SPEED = 2600; // points per second

  if (reduce) pts = total();

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible) return;

    if (!reduce) {
      if (phase === "print") {
        pts = Math.min(total(), pts + SPEED * dt * (0.6 + 0.4 * Math.min(1, pts / 3000)));
        if (pts >= total()) { phase = "hold"; hold = 0; }
      } else if (phase === "hold") {
        hold += dt; if (hold > 2.2) { phase = "fade"; hold = 0; }
      } else if (phase === "fade") {
        hold += dt; mat.opacity = Math.max(0, 1 - hold / 0.7);
        if (hold > 0.8) { shapeIx++; build(shapeIx); phase = "print"; }
      }
      angle += dt * 0.18;
    }

    const n = Math.max(1, Math.floor(pts));
    geo.instanceCount = n;
    const p = Math.min(n, positions.length / 3 - 1) * 3;
    const x = positions[p], y = positions[p + 1], z = positions[p + 2];
    nozzle.position.set(x, y + 0.02 + (phase === "print" ? 0 : Math.min(0.35, hold * 0.3)), z);
    spark.visible = phase === "print"; tip.intensity = phase === "print" ? 2 + Math.random() * 0.6 : 0.5;

    // HUD
    const layer = Math.min(shape.layers, Math.floor(n / SEG) + 1);
    if (hud.layer) hud.layer.textContent = String(layer).padStart(3, "0");
    if (hud.z) hud.z.textContent = ((n / SEG) * 0.2).toFixed(2);
    if (hud.bar) hud.bar.style.width = ((n / total()) * 100).toFixed(1) + "%";

    // camera
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    const a = angle + mx * 0.8;
    const camH = 2.6 + my * 1.2;
    const fit = 9.2 * Math.max(1, 0.95 / camera.aspect);
    camera.position.set(Math.cos(a) * fit, camH + 1.4, Math.sin(a) * fit);
    camera.lookAt(0, 1.15, 0);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}
