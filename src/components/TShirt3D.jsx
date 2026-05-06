import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  useGLTF,
  OrbitControls,
  Environment,
  ContactShadows,
  Decal,
  Center,
} from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
//  Shirt Mesh Loader
// ─────────────────────────────────────────────────────────────
const COLOR_MAP = {
  white: '#f5f5f5',
  black: '#0f0f0f',
  blue: '#1d3a8a',
  red: '#991b1b',
  green: '#14532d',
  beige: '#e8dcc8',
};

const ShirtModel = ({ color, frontImage, backImage }) => {
  const { nodes, materials } = useGLTF('/shirt_baked.glb');
  const groupRef = useRef();

  // Load Textures
  const [frontTex, setFrontTex] = useState(null);
  const [backTex, setBackTex] = useState(null);

  useEffect(() => {
    if (frontImage) {
      new THREE.TextureLoader().load(frontImage, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setFrontTex(tex);
      });
    } else {
      setFrontTex(null);
    }
  }, [frontImage]);

  useEffect(() => {
    if (backImage) {
      new THREE.TextureLoader().load(backImage, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setBackTex(tex);
      });
    } else {
      setBackTex(null);
    }
  }, [backImage]);

  // Apply color
  useEffect(() => {
    const hex = COLOR_MAP[color] || COLOR_MAP.white;
    if (materials.lambert1) {
      materials.lambert1.color.set(hex);
      materials.lambert1.needsUpdate = true;
    }
  }, [color, materials]);

  return (
    <group ref={groupRef} scale={[1.8, 1.8, 1.8]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={materials.lambert1}
        material-roughness={1}
        dispose={null}
      >
        {/* FRONT decal */}
        {frontTex && (
          <Decal
            position={[0, -0.06, 0.15]}
            rotation={[0, 0, 0]}
            scale={[0.15, 0.2, 0.15]}
            map={frontTex}
            depthTest={true}
            depthWrite={true}
            polygonOffset
            polygonOffsetFactor={-10}
          />
        )}

        {/* BACK decal */}
        {backTex && (
          <Decal
            position={[0, -0.06, -0.15]}
            rotation={[0, Math.PI, 0]}
            scale={[0.15, 0.2, 0.15]}
            map={backTex}
            depthTest={true}
            depthWrite={true}
            polygonOffset
            polygonOffsetFactor={-10}
          />
        )}
      </mesh>
    </group>
  );
};

// Preload the model
useGLTF.preload('/shirt_baked.glb');

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
        minHeight: 340,
        borderRadius: 24,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #0d0d18 0%, #090912 100%)',
        cursor: 'grab',
      }}
    >
      {!ready && <Loader />}

      <Canvas
        shadows
        camera={{ position: [0, 0, 1.2], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={() => setReady(true)}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[3, 5, 4]} intensity={2.5} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-3, 2, -4]} intensity={0.8} color="#c0c8ff" />
        
        <Suspense fallback={null}>
          <Center position={[0, -0.3, 0]}>
            <ShirtModel color={color} frontImage={frontImage} backImage={backImage} />
          </Center>
          <Environment preset="city" />
          <ContactShadows position={[0, -0.85, 0]} opacity={0.4} scale={3} blur={2} far={1.5} />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
          target={[0, -0.25, 0]}
        />
      </Canvas>

      <div
        style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em',
          textTransform: 'uppercase', pointerEvents: 'none', whiteSpace: 'nowrap',
          fontFamily: 'inherit',
        }}
      >
        ← aylantiring →
      </div>
    </div>
  );
};
export default TShirt3D;
