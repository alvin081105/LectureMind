import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Torus, Icosahedron, Octahedron, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';
import type { Mesh, ShaderMaterial as ThreeShaderMaterial } from 'three';

// 그라디언트 셰이더 팩토리
function makeGradientMaterial(colorA: string, colorB: string, opacity = 0.28) {
  return new THREE.ShaderMaterial({
    uniforms: {
      colorA: { value: new THREE.Color(colorA) },
      colorB: { value: new THREE.Color(colorB) },
      uOpacity: { value: opacity },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 colorA;
      uniform vec3 colorB;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        // Y축 + 노멀 방향 합산으로 자연스러운 그라디언트
        float t = clamp(vNormal.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 color = mix(colorB, colorA, t);
        // 엣지 fresnel 느낌
        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 1.5);
        color = mix(color, colorA, fresnel * 0.3);
        gl_FragColor = vec4(color, uOpacity);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

// ── 각 도형 컴포넌트 ──────────────────────────────────────────

function GradientTorus({ position, colorA, colorB, speed = 1, rotX = 0, rotZ = 0, size = 1 }: {
  position: [number, number, number];
  colorA: string; colorB: string;
  speed?: number; rotX?: number; rotZ?: number; size?: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<ThreeShaderMaterial>(null);
  const mat = useMemo(() => makeGradientMaterial(colorA, colorB, 0.30), [colorA, colorB]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.28 * speed;
      meshRef.current.rotation.y += delta * 0.18 * speed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={1.6} floatingRange={[-0.4, 0.4]}>
      <Torus
        ref={meshRef}
        position={position}
        args={[size, size * 0.28, 24, 100]}
        rotation={[rotX, 0, rotZ]}
      >
        <primitive ref={matRef} object={mat} attach="material" />
      </Torus>
    </Float>
  );
}

function GradientIcosahedron({ position, colorA, colorB, speed = 1, size = 0.9 }: {
  position: [number, number, number];
  colorA: string; colorB: string;
  speed?: number; size?: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const mat = useMemo(() => makeGradientMaterial(colorA, colorB, 0.25), [colorA, colorB]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.22 * speed;
      meshRef.current.rotation.z += delta * 0.16 * speed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={2.0} floatingRange={[-0.5, 0.5]}>
      <Icosahedron ref={meshRef} position={position} args={[size]}>
        <primitive object={mat} attach="material" />
      </Icosahedron>
    </Float>
  );
}

function GradientOctahedron({ position, colorA, colorB, speed = 1, size = 0.8 }: {
  position: [number, number, number];
  colorA: string; colorB: string;
  speed?: number; size?: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const mat = useMemo(() => makeGradientMaterial(colorA, colorB, 0.27), [colorA, colorB]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.32 * speed;
      meshRef.current.rotation.x += delta * 0.14 * speed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.55} floatIntensity={1.8} floatingRange={[-0.4, 0.4]}>
      <Octahedron ref={meshRef} position={position} args={[size]}>
        <primitive object={mat} attach="material" />
      </Octahedron>
    </Float>
  );
}

function GradientTorusKnot({ position, colorA, colorB, speed = 1 }: {
  position: [number, number, number];
  colorA: string; colorB: string;
  speed?: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const mat = useMemo(() => makeGradientMaterial(colorA, colorB, 0.26), [colorA, colorB]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.18 * speed;
      meshRef.current.rotation.y += delta * 0.25 * speed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.28} floatIntensity={1.3} floatingRange={[-0.3, 0.3]}>
      <TorusKnot ref={meshRef} position={position} args={[0.6, 0.2, 128, 24]}>
        <primitive object={mat} attach="material" />
      </TorusKnot>
    </Float>
  );
}

// ── 씬 ────────────────────────────────────────────────────────

function Scene() {
  return (
    <>
      {/* Torus – 퍼플→인디고 */}
      <GradientTorus position={[-6.5, 2.5, -4]} colorA="#e9d5ff" colorB="#7c3aed" speed={0.7} rotX={0.6} size={1.2} />
      <GradientTorus position={[6.0, -2.5, -5]} colorA="#ddd6fe" colorB="#4338ca" speed={1.0} rotZ={0.4} size={1.0} />
      <GradientTorus position={[2.0, 3.5, -6]} colorA="#fae8ff" colorB="#9333ea" speed={0.6} rotX={0.9} size={0.85} />

      {/* Icosahedron – 핑크→바이올렛 */}
      <GradientIcosahedron position={[5.5, 2.0, -4]} colorA="#f5d0fe" colorB="#7c3aed" speed={0.9} size={1.0} />
      <GradientIcosahedron position={[-5.0, -2.8, -5]} colorA="#e0e7ff" colorB="#4f46e5" speed={1.2} size={0.85} />

      {/* Octahedron – 스카이→인디고 */}
      <GradientOctahedron position={[-3.0, 3.2, -4]} colorA="#bfdbfe" colorB="#6366f1" speed={1.0} size={0.9} />
      <GradientOctahedron position={[7.0, 0.8, -6]} colorA="#ddd6fe" colorB="#6d28d9" speed={0.75} size={1.1} />
      <GradientOctahedron position={[-7.0, -0.5, -5]} colorA="#e9d5ff" colorB="#4338ca" speed={0.85} size={0.75} />

      {/* TorusKnot – 로즈→퍼플 */}
      <GradientTorusKnot position={[-4.0, -3.2, -5]} colorA="#fbcfe8" colorB="#9333ea" speed={0.8} />
      <GradientTorusKnot position={[4.5, 3.0, -6]} colorA="#c7d2fe" colorB="#6366f1" speed={0.65} />
    </>
  );
}

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 65 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
