import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader } from 'three';
import { fetchSensors } from '../services/api';
import './GlobePage.css';

// Load Earth texture
const Earth = () => {
  const texture = useMemo(() => new TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'), []);
  return (
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

// Render pins for sensors
const SensorPins = ({ sensors = [] }) => {
  return (sensors || []).map((s) => {
    if (!s.location?.coordinates?.lat || !s.location?.coordinates?.lng) return null;
    const phi = (90 - s.location.coordinates.lat) * (Math.PI / 180);
    const theta = (s.location.coordinates.lng + 180) * (Math.PI / 180);
    const radius = 2.02;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return (
      <mesh key={s.sensorId} position={[x, y, z]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
    );
  });
};

const GlobePage = () => {
  const [sensors, setSensors] = React.useState([]);

  React.useEffect(() => {
    fetchSensors()
      .then((res) => setSensors(res.data?.data || []))
      .catch(() => setSensors([]));
  }, []);

  return (
    <div className="globe-container">
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Suspense fallback={null}>
          <Earth />
          <SensorPins sensors={sensors} />
        </Suspense>
        <OrbitControls enableZoom={true} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      </Canvas>
    </div>
  );
};

export default GlobePage;
