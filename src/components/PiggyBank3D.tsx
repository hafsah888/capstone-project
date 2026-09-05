"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import type { Group, Mesh } from "three";

const colors = [
  { name: "Coral", value: "#f97370" },
  { name: "Mint", value: "#35c6a5" },
  { name: "Gold", value: "#e6ad45" },
];

function PigModel({ color, bounce }: { color: string; bounce: boolean }) {
  const group = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      setTargetRotation({ x: y * 0.35, y: x * 0.5 });
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointer);
  }, []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const time = clock.getElapsedTime();
    group.current.rotation.y += (0.12 + targetRotation.y - group.current.rotation.y) * 0.025;
    group.current.rotation.x += (targetRotation.x - group.current.rotation.x) * 0.025;
    group.current.position.y = Math.sin(time * 1.4) * 0.035;
    if (bounce) {
      group.current.rotation.z = Math.sin(time * 12) * 0.08;
      group.current.scale.setScalar(1 + Math.max(0, Math.sin(time * 8)) * 0.08);
    } else {
      group.current.rotation.z *= 0.92;
      group.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={group}>
      <mesh ref={body} castShadow receiveShadow>
        <sphereGeometry args={[1.18, 24, 16]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh position={[0.94, 0.12, 0]} castShadow>
        <sphereGeometry args={[0.48, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh position={[1.28, 0.18, 0.31]}>
        <sphereGeometry args={[0.07, 12, 8]} />
        <meshStandardMaterial color="#3f2933" roughness={0.5} />
      </mesh>
      <mesh position={[1.28, 0.18, -0.31]}>
        <sphereGeometry args={[0.07, 12, 8]} />
        <meshStandardMaterial color="#3f2933" roughness={0.5} />
      </mesh>
      <mesh position={[0.05, 1.12, 0]} rotation={[0, 0, 0.08]} castShadow>
        <boxGeometry args={[0.34, 0.12, 0.5]} />
        <meshStandardMaterial color="#e6ad45" metalness={0.25} roughness={0.45} />
      </mesh>
      {[-0.58, 0.58].map((x) => (
        <mesh key={x} position={[x, -1, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.28, 12]} />
          <meshStandardMaterial color={color} roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[-1.12, 0.34, 0]} rotation={[0, 0, -0.8]}>
        <torusGeometry args={[0.28, 0.055, 8, 16, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
    </group>
  );
}

function StaticPiggyBank({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 240 180" role="img" aria-label="Static piggy bank illustration" className="h-full w-full">
      <ellipse cx="120" cy="150" rx="76" ry="12" fill="#dbe4ef" />
      <ellipse cx="112" cy="94" rx="68" ry="48" fill={color} />
      <circle cx="171" cy="94" r="28" fill={color} />
      <circle cx="180" cy="88" r="4" fill="#3f2933" />
      <rect x="91" y="42" width="32" height="10" rx="4" fill="#e6ad45" />
      <path d="M47 90c-20-22-28 13-10 21" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <circle cx="78" cy="143" r="13" fill={color} /><circle cx="145" cy="143" r="13" fill={color} />
    </svg>
  );
}

export default function PiggyBank3D() {
  const [color, setColor] = useState(colors[0].value);
  const [bounce, setBounce] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const changeColor = (nextColor: string) => {
    setColor(nextColor);
    setBounce(true);
    window.setTimeout(() => setBounce(false), 650);
  };

  return (
    <section aria-labelledby="piggy-bank-title" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Savings companion</p>
          <h2 id="piggy-bank-title" className="mt-1 text-lg font-semibold text-slate-900">Your little money keeper</h2>
        </div>
        <div className="flex gap-2" aria-label="Piggy bank colors">
          {colors.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-label={`Change color to ${item.name}`}
              aria-pressed={color === item.value}
              onClick={() => changeColor(item.value)}
              className="h-7 w-7 rounded-full border-2 border-white shadow ring-1 ring-slate-200 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              style={{ backgroundColor: item.value }}
            />
          ))}
        </div>
      </div>
      <div className="h-64 bg-gradient-to-b from-sky-50 to-white">
        {reducedMotion ? (
          <div className="h-full p-8"><StaticPiggyBank color={color} /></div>
        ) : (
          <Canvas shadows camera={{ position: [0, 0.4, 4.2], fov: 38 }} dpr={[1, 1.5]}>
            <ambientLight intensity={1.6} />
            <directionalLight position={[3, 4, 4]} intensity={2.2} castShadow shadow-mapSize={[512, 512]} />
            <PigModel color={color} bounce={bounce} />
            <ContactShadows position={[0, -1.35, 0]} opacity={0.28} scale={4} blur={2.5} far={3} />
            <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.4} maxPolarAngle={Math.PI / 1.8} />
          </Canvas>
        )}
      </div>
      <p className="px-5 py-3 text-xs text-slate-500">Drag to explore, or choose a color to give it a small celebratory bounce.</p>
    </section>
  );
}