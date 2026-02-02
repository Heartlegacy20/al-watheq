import Head from 'next/head';
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function SceneBackground({ isAlert }) {
  const group = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.1; 
  });
  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[0, -1, 0]} castShadow>
          <boxGeometry args={[4, 1, 6]} />
          <meshStandardMaterial color={isAlert ? "#1e40af" : "#0f172a"} metalness={1} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.2, 0.5]}>
          <boxGeometry args={[2.5, 1, 3]} />
          <MeshDistortMaterial color={isAlert ? "#3b82f6" : "#1e293b"} speed={2} distort={0.2} metalness={1} />
        </mesh>
      </Float>
    </group>
  );
}

export default function FinalImmersiveApp() {
  const [stats, setStats] = useState({ total: 0, automated: 0, active: 0 });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('tickets').select('*');
      if (data) {
        setStats({
          total: data.length,
          automated: data.filter(t => t.status === 'تم الرد').length,
          active: data.filter(t => t.status === 'انتظار' || t.status === 'نشط').length
        });
      }
    };
    fetchData();
  }, []);

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    setIsLoading(true);
    setIsAlert(true);
    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage("");

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Body: chatMessage, From: "مدير النظام" }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "عذراً، حدث خطأ في الاتصال." }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAlert(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden font-sans" dir="rtl">
      <Head><title>الواثق AI | Tactical 3D</title></Head>

      {/* 3D Engine Background */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[8, 5, 15]} fov={35} />
          <Suspense fallback={null}>
            <SceneBackground isAlert={isAlert} />
            <Environment preset="night" />
            <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={20} blur={2.5} far={4} />
            <OrbitControls enableZoom={false} />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Content Layer */}
      <main className="relative z-10 container mx-auto p-10 pointer-events-none">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items
