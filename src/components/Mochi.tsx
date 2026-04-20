import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, useCursor } from '@react-three/drei';
import * as THREE from 'three';

export type MochiEmotion = 'HAPPY' | 'SHY' | 'SAD' | 'SURPRISED' | 'CLUMSY' | 'IDLE';

interface MochiProps {
  isTalking: boolean;
  emotion: MochiEmotion;
  onPoke: () => void;
}

export default function Mochi({ isTalking, emotion = 'IDLE', onPoke }: MochiProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const faceRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [pushed, setPushed] = useState(false);
  useCursor(hovered);

  // Mochi logic: bobbing and talking animation
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Smooth idle bobbing
    meshRef.current.position.y = Math.sin(t * 2) * 0.1;

    // SHY animation: shaking a bit
    if (emotion === 'SHY') {
      meshRef.current.position.x = Math.sin(t * 15) * 0.02;
    } else {
      meshRef.current.position.x = 0;
    }
    
    // Squash/Stretch when talking
    if (isTalking) {
      meshRef.current.scale.y = 1 + Math.sin(t * 12) * 0.08;
      meshRef.current.scale.x = 1 - Math.sin(t * 12) * 0.04;
    } else {
      const targetScale = pushed ? 1.2 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      if (Math.abs(meshRef.current.scale.x - targetScale) < 0.01) setPushed(false);
    }

    // Facing the camera slightly
    if (faceRef.current) {
      faceRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    }
  });

  const handlePointerDown = () => {
    setPushed(true);
    onPoke();
  };

  // Emotion-based colors and materials
  const mochiColor = emotion === 'SHY' ? '#ffccd5' : (emotion === 'SAD' ? '#d1e8ff' : '#ffd1dc');
  const blushOpacity = emotion === 'SHY' ? 0.9 : 0.4;

  return (
    <group>
      <Sphere
        args={[1.5, 64, 64]}
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={handlePointerDown}
      >
        <MeshDistortMaterial
          color={mochiColor}
          speed={isTalking ? 4 : 2}
          distort={emotion === 'SURPRISED' ? 0.4 : 0.2}
          radius={1}
          roughness={0.2}
          metalness={0.1}
        />
        {/* Faces */}
        <group ref={faceRef} position={[0, 0, 1.4]} scale={[0.1, 0.1, 0.1]}>
          {/* Robot Eyes Container */}
          <group position={[-2, 0.7, 0]}>
            {/* Outer Lens Ring */}
            <mesh>
              <ringGeometry args={[0.6, 0.8, 32]} />
              <meshBasicMaterial color="#333" />
            </mesh>
            {/* Glowing Digital Pupil */}
            <mesh position={[0, 0, 0.1]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshBasicMaterial color={emotion === 'SHY' ? '#ff99aa' : '#00ffd2'} />
            </mesh>
            {/* Reflection / Robot Light */}
            <mesh position={[0.15, 0.15, 0.2]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </group>

          <group position={[2, 0.7, 0]}>
            {/* Outer Lens Ring */}
            <mesh>
              <ringGeometry args={[0.6, 0.8, 32]} />
              <meshBasicMaterial color="#333" />
            </mesh>
            {/* Glowing Digital Pupil */}
            <mesh position={[0, 0, 0.1]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshBasicMaterial color={emotion === 'SHY' ? '#ff99aa' : '#00ffd2'} />
            </mesh>
            {/* Reflection / Robot Light */}
            <mesh position={[0.15, 0.15, 0.2]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </group>

          {/* Mouth */}
          {emotion === 'SURPRISED' ? (
            <mesh position={[0, -1, 0]}>
              <ringGeometry args={[0.4, 0.6, 32]} />
              <meshBasicMaterial color="#333" />
            </mesh>
          ) : emotion === 'SAD' ? (
            <mesh position={[0, -1.2, 0]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.5, 0.1, 8, 16, Math.PI]} />
              <meshBasicMaterial color="#333" />
            </mesh>
          ) : (
            <mesh position={[0, -1, 0]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.6, 0.1, 8, 16, Math.PI]} />
              <meshBasicMaterial color="#333" />
            </mesh>
          )}

          {/* Cheeks / Blush */}
          <mesh position={[-3, -0.2, -0.2]}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshBasicMaterial color="#ff99aa" transparent opacity={blushOpacity} />
          </mesh>
          <mesh position={[3, -0.2, -0.2]}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshBasicMaterial color="#ff99aa" transparent opacity={blushOpacity} />
          </mesh>
        </group>
      </Sphere>
      
      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial color="#000" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}
