import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  useGLTF,
  OrbitControls,
  Environment,
  ContactShadows,
  Decal,
  useTexture,
} from '@react-three/drei';
import * as THREE from 'three';

// ─── Shirt mesh ───────────────────────────────────────────────
const ShirtModel = ({ color, frontImage, backImage }) => {
  const { scene } = useGLTF('/oversized_t-shirt.glb');
  const groupRef = useRef();

  // Color map
  const colorMap = {
    white: '#f5f5f5',
    black: '#0f0f0f',
    blue: '#1d3a8a',
    red: '#991b1b',
    green: '#14532d',
    beige: '#e8dcc8',
  };

  // Front texture (upload qilingan rasm)
  const [frontTex, setFrontTex] = useState(null);
  const [backTex, setBackTex] = useState(null);

  useEffect(() => {
    if (frontImage) {
      const loader = new THREE.TextureLoader();
      loader.load(frontImage, (tex) => {
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        setFrontTex(tex);
      });
    } else {
      setFrontTex(null);
    }
  }, [frontImage]);

  useEffect(() => {
    if (backImage) {
      const loader = new THREE.TextureLoader();
      loader.load(backImage, (tex) => {
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        setBackTex(tex);
      });
    } else {
      setBackTex(null);
    }
  }, [backImage]);

  // Apply color to all meshes inside the GLB
  useEffect(() => {
    const hex = colorMap[color] || colorMap.white;
    scene.traverse((child) => {
      if (child.isMesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            mat.color.set(hex);
            mat.needsUpdate = true;
          });
        } else if (child.material) {
          child.material.color.set(hex);
          child.material.needsUpdate = true;
        }
      }
    });
  }, [color, scene]);

  // Collect shirt meshes for decal targets
  const meshes = [];
  scene.traverse((child) => {
    if (child.isMesh) meshes.push(child);
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />

      {/* FRONT decal */}
      {frontTex && meshes[0] && (
        <Decal
          mesh={meshes[0]}
          position={[0, 0.04, 0.09]}
          rotation={[0, 0, 0]}
          scale={[0.28, 0.28, 0.28]}
          map={frontTex}
          polygonOffset
          polygonOffsetFactor={-10}
          depthTest
        />
      )}

      {/* BACK decal */}
      {backTex && meshes[0] && (
        <Decal
          mesh={meshes[0]}
          position={[0, 0.04, -0.09]}
          rotation={[0, Math.PI, 0]}
          scale={[0.28, 0.28, 0.28]}
          map={backTex}
          polygonOffset
          polygonOffsetFactor={-10}
          depthTest
        />
      )}
    </group>
  );
};

// Preload the model
useGLTF.preload('/oversized_t-shirt.glb');

// ─── Loading spinner ──────────────────────────────────────────
const Loader = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      gap: 12,
      zIndex: 10,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        border: '3px solid rgba(99,102,241,0.2)',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'inherit' }}>
      Yuklanmoqda...
    </span>
  </div>
);

// ─── Main export ──────────────────────────────────────────────
const TShirt3D = ({ color = 'white', frontImage = null, backImage = null }) => {
  const [ready, setReady] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 420,
        borderRadius: 24,
        overflow: 'hidden',
        background: '#0a0a12',
      }}
    >
      {!ready && <Loader />}

      <Canvas
        shadows
        camera={{ position: [0, 0.1, 1.6], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={() => setReady(true)}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={1.2} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={2.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 2, -4]} intensity={0.8} color="#c0c8ff" />
        <pointLight position={[0, 3, 3]} intensity={0.6} color="#ffffff" />

        <Suspense fallback={null}>
          <ShirtModel
            color={color}
            frontImage={frontImage}
            backImage={backImage}
          />
          <Environment preset="studio" />
          <ContactShadows
            position={[0, -0.55, 0]}
            opacity={0.35}
            scale={3}
            blur={2.5}
            far={1.5}
          />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
          rotateSpeed={0.55}
          target={[0, 0.05, 0]}
        />
      </Canvas>

      {/* Drag hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 11,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'inherit',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        ← aylantiring →
      </div>
    </div>
  );
};

export default TShirt3D;