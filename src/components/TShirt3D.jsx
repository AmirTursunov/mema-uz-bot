import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, useGLTF, Decal, Center } from '@react-three/drei';
import * as THREE from 'three';
import TShirtPreview from './TShirtPreview';

const TShirtModel = ({ color, image }) => {
  const { nodes, materials } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tshirt/model.gltf');
  
  const texture = image ? useLoader(THREE.TextureLoader, image) : null;

  return (
    <Center top>
      <mesh castShadow receiveShadow geometry={nodes.tshirt.geometry} rotation={[0, 0, 0]} scale={2.2}>
        <meshStandardMaterial color={color} roughness={0.7} />
        {texture && (
          <Decal position={[0, 0.05, 0.15]} rotation={[0, 0, 0]} scale={[0.15, 0.2, 0.1]} map={texture} polygonOffset polygonOffsetFactor={-10} />
        )}
      </mesh>
    </Center>
  );
};

const TShirt3D = ({ color = 'white', image }) => {
  const [loadError, setLoadError] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) setWebglSupported(false);
  }, []);

  // If 3D fails or not supported, show the high-quality SVG fallback
  if (loadError || !webglSupported) {
    return (
      <div style={{ padding: '20px', background: '#111', borderRadius: '24px' }}>
        <TShirtPreview color={color} image={image} interactive={false} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', background: '#111' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 2.5], fov: 45 }} 
        onError={() => setLoadError(true)}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={1} />
        
        <Suspense fallback={null}>
          <TShirtModel 
            color={color} 
            image={image} 
            // We can't easily catch errors inside TShirtModel here, 
            // but useGLTF will throw if it fails.
          />
          <Environment preset="city" />
          <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} />
        </Suspense>
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default TShirt3D;
