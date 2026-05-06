import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
//  Pure Three.js futbolka — GLB fayl kerak emas
//  Telegram WebApp + barcha brauzerda ishlaydi
// ─────────────────────────────────────────────────────────────

const COLOR_MAP = {
  white: { shirt: 0xf2f2f2, dark: 0xdadada, seam: 0xbcbcbc },
  black: { shirt: 0x111114, dark: 0x08080a, seam: 0x222228 },
  blue: { shirt: 0x1e3a8a, dark: 0x152a66, seam: 0x1a3070 },
  red: { shirt: 0x991b1b, dark: 0x7a1414, seam: 0x841616 },
};

// ── Build shirt geometry ──────────────────────────────────────
function buildShirt(scene, colorKey) {
  const old = scene.getObjectByName('shirtGroup');
  if (old) {
    old.traverse((c) => { if (c.isMesh) { c.geometry.dispose(); } });
    scene.remove(old);
  }

  const col = COLOR_MAP[colorKey] || COLOR_MAP.white;
  const group = new THREE.Group();
  group.name = 'shirtGroup';

  const mkMat = (hex, rough = 0.82) =>
    new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: 0 });

  // ── BODY ──────────────────────────────────────────
  const body = new THREE.Shape();
  body.moveTo(-0.40, -1.15);
  body.lineTo(-0.40, 0.88);
  body.lineTo(-0.28, 1.04);   // left shoulder
  body.bezierCurveTo(-0.22, 1.14, -0.12, 1.18, 0, 1.18);  // left neck
  body.bezierCurveTo(0.12, 1.18, 0.22, 1.14, 0.28, 1.04);  // right neck
  body.lineTo(0.40, 0.88);
  body.lineTo(0.40, -1.15);
  body.bezierCurveTo(0.40, -1.22, 0.32, -1.26, 0, -1.26);
  body.bezierCurveTo(-0.32, -1.26, -0.40, -1.22, -0.40, -1.15);

  const bodyGeo = new THREE.ExtrudeGeometry(body, {
    depth: 0.16, bevelEnabled: true,
    bevelThickness: 0.014, bevelSize: 0.009, bevelSegments: 4,
  });
  bodyGeo.center();

  const bodyMesh = new THREE.Mesh(bodyGeo, mkMat(col.shirt));
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // ── LEFT SLEEVE ───────────────────────────────────
  group.add(makeSleeve(col, -1));
  // ── RIGHT SLEEVE ──────────────────────────────────
  group.add(makeSleeve(col, 1));

  // ── COLLAR (tube) ─────────────────────────────────
  const collarPts = [
    new THREE.Vector3(-0.21, 0, 0.09),
    new THREE.Vector3(-0.10, 0.07, 0.09),
    new THREE.Vector3(0, 0.09, 0.09),
    new THREE.Vector3(0.10, 0.07, 0.09),
    new THREE.Vector3(0.21, 0, 0.09),
  ];
  const collarCurve = new THREE.CatmullRomCurve3(collarPts);
  const collarGeo = new THREE.TubeGeometry(collarCurve, 20, 0.024, 8, false);
  const collar = new THREE.Mesh(collarGeo, mkMat(col.seam, 0.9));
  collar.position.y = 0.64;
  group.add(collar);

  // ── CENTER SEAM ───────────────────────────────────
  const seamGeo = new THREE.CylinderGeometry(0.007, 0.007, 2.3, 6);
  const seam = new THREE.Mesh(seamGeo, mkMat(col.seam, 0.9));
  seam.position.z = 0.085;
  group.add(seam);

  group.rotation.x = 0.06;
  group.scale.setScalar(0.68);
  scene.add(group);
}

function makeSleeve(col, side) {
  const mkMat = (hex) =>
    new THREE.MeshStandardMaterial({ color: hex, roughness: 0.82, metalness: 0 });

  const sh = new THREE.Shape();
  sh.moveTo(0, 0);
  sh.lineTo(side * 0.42, 0.06);
  sh.lineTo(side * 0.46, -0.35);
  sh.lineTo(side * 0.24, -0.42);
  sh.lineTo(0, -0.30);
  sh.closePath();

  const geo = new THREE.ExtrudeGeometry(sh, {
    depth: 0.13, bevelEnabled: true,
    bevelThickness: 0.009, bevelSize: 0.006, bevelSegments: 3,
  });

  const mesh = new THREE.Mesh(geo, mkMat(col.shirt));
  mesh.castShadow = true;
  mesh.position.set(side < 0 ? -0.66 : 0.66, 0.26, 0);

  // cuff ring
  const cuffGeo = new THREE.TorusGeometry(0.10, 0.016, 8, 24);
  const cuff = new THREE.Mesh(cuffGeo, mkMat(col.seam));
  cuff.rotation.x = Math.PI / 2;
  cuff.position.set(side * 0.24, -0.38, 0.065);
  mesh.add(cuff);

  return mesh;
}

// ── Add / update image decal ──────────────────────────────────
function setDecal(scene, imageDataUrl, slot) {
  const name = `decal_${slot}`;
  const group = scene.getObjectByName('shirtGroup');
  if (!group) return;

  // remove old
  const old = group.getObjectByName(name);
  if (old) { old.geometry.dispose(); old.material.dispose(); group.remove(old); }
  if (!imageDataUrl) return;

  const loader = new THREE.TextureLoader();
  loader.load(imageDataUrl, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.PlaneGeometry(0.50, 0.60);
    const mat = new THREE.MeshStandardMaterial({
      map: tex, transparent: true, depthWrite: false, roughness: 0.7,
    });
    const plane = new THREE.Mesh(geo, mat);
    plane.name = name;
    plane.renderOrder = 1;
    if (slot === 'front') {
      plane.position.set(0, 0.03, 0.122);
    } else {
      plane.position.set(0, 0.03, -0.122);
      plane.rotation.y = Math.PI;
    }
    group.add(plane);
  });
}

// ─────────────────────────────────────────────────────────────
//  React Component
// ─────────────────────────────────────────────────────────────
const TShirt3D = ({ color = 'white', frontImage = null, backImage = null }) => {
  const mountRef = useRef(null);
  const ctx = useRef({
    renderer: null, scene: null, camera: null, rafId: null,
    isDrag: false, px: 0, py: 0, rotY: 0.25, rotX: 0.05,
  });
  const [ready, setReady] = useState(false);

  // Init
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const c = ctx.current;

    const W = el.clientWidth || 360;
    const H = 420;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);
    c.renderer = renderer;

    const scene = new THREE.Scene();
    c.scene = scene;

    const camera = new THREE.PerspectiveCamera(36, W / H, 0.01, 50);
    camera.position.set(0, 0, 3.4);
    c.camera = camera;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1.3));
    const key = new THREE.DirectionalLight(0xfffaf0, 2.6);
    key.position.set(2, 4, 3); key.castShadow = true; scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8dcff, 1.1);
    fill.position.set(-3, 1, -2); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.5);
    rim.position.set(0, -3, -3); scene.add(rim);

    buildShirt(scene, color);
    setReady(true);

    let idle = 0;
    const animate = () => {
      c.rafId = requestAnimationFrame(animate);
      if (!c.isDrag) { idle += 0.006; c.rotY = 0.25 + Math.sin(idle) * 0.08; }
      const g = scene.getObjectByName('shirtGroup');
      if (g) { g.rotation.y = c.rotY; g.rotation.x = c.rotX; }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = el.clientWidth;
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
      renderer.setSize(w, H);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(c.rafId);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  // Color
  useEffect(() => {
    const c = ctx.current;
    if (!c.scene) return;
    buildShirt(c.scene, color);
    setDecal(c.scene, frontImage, 'front');
    setDecal(c.scene, backImage, 'back');
  }, [color]);

  // Images
  useEffect(() => {
    const c = ctx.current;
    if (!c.scene) return;
    setDecal(c.scene, frontImage, 'front');
  }, [frontImage]);

  useEffect(() => {
    const c = ctx.current;
    if (!c.scene) return;
    setDecal(c.scene, backImage, 'back');
  }, [backImage]);

  // Drag
  const down = useCallback((e) => {
    const c = ctx.current; c.isDrag = true;
    c.px = e.touches ? e.touches[0].clientX : e.clientX;
    c.py = e.touches ? e.touches[0].clientY : e.clientY;
  }, []);
  const move = useCallback((e) => {
    const c = ctx.current; if (!c.isDrag) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    c.rotY += (x - c.px) * 0.013;
    c.rotX = Math.max(-0.45, Math.min(0.45, c.rotX + (y - c.py) * 0.006));
    c.px = x; c.py = y;
  }, []);
  const up = useCallback(() => { ctx.current.isDrag = false; }, []);

  return (
    <div
      ref={mountRef}
      onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
      onTouchStart={down} onTouchMove={move} onTouchEnd={up}
      style={{
        position: 'relative', width: '100%', height: 420,
        borderRadius: 24, overflow: 'hidden',
        background: 'linear-gradient(160deg, #0d0d18 0%, #090912 100%)',
        cursor: 'grab', touchAction: 'none', userSelect: 'none',
      }}
    >
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36,
            border: '3px solid rgba(99,102,241,0.25)',
            borderTop: '3px solid #6366f1', borderRadius: '50%',
            animation: 'ts3dspin .7s linear infinite',
          }} />
          <style>{`@keyframes ts3dspin{to{transform:rotate(360deg)}}`}</style>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }}>
            Yuklanmoqda...
          </span>
        </div>
      )}
      <div style={{
        position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em',
        textTransform: 'uppercase', pointerEvents: 'none', whiteSpace: 'nowrap',
        fontFamily: 'inherit',
      }}>
        ← aylantiring →
      </div>
    </div>
  );
};

export default TShirt3D;