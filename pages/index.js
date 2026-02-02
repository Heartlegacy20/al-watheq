import Head from 'next/head';
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// مكون مشهد الخلفية 3D
function SceneBackground() {
  const group = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.1; // دوران بطيء جداً للخلفية
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* جسم الدبابة "الواثق" المعدني */}
        <mesh position={[0, -1, 0]} castShadow>
          <boxGeometry args={[4, 1, 6]} />
          <meshStandardMaterial color="#0f172a" metalness={1} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.2, 0.5]}>
          <boxGeometry args={[2.5, 1, 3]} />
          <MeshDistortMaterial color="#1e293b" speed={2} distort={0.1} metalness={1} />
        </mesh>
        <mesh position={[0, 0.5, 4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 4]} />
          <meshStandardMaterial color="#334155" metalness={1} />
        </mesh>
      </Float>
    </group>
  );
}

export default function Full3DExperience() {
  const [stats, setStats] = useState({ total: 0, automated: 0, active: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('tickets').select('*');
      if (data) {
        setStats({
          total: data.length,
          automated: data.filter(t => t.status === 'تم الرد').length,
          active: data.filter(t => t.status === 'انتظار').length
        });
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <Head>
        <title>الواثق | التجربة الغامرة 3D</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* الطبقة الأولى: محرك الـ 3D كخلفية ثابتة */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[8, 5, 15]} fov={35} />
          <Suspense fallback={null}>
            <SceneBackground />
            <Environment preset="night" />
            <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={20} blur={2.5} far={4} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          </Suspense>
        </Canvas>
      </div>

      {/* الطبقة الثانية: واجهة المستخدم الزجاجية الطافية */}
      <main className="relative z-10 container mx-auto px-6 py-12 pointer-events-none">
        
        {/* Header - Floating Glass */}
        <motion.nav 
          initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] mb-12 pointer-events-auto"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <span className="text-2xl font-black italic">W</span>
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">Al-Watheq Immersive</h1>
          </div>
          <div className="text-[10px] font-bold text-blue-400 tracking-[0.4em]">TACTICAL OS v2.0</div>
        </motion.nav>

        {/* Stats Cards - Immersive Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 pointer-events-auto">
          {[
            { label: 'إجمالي المحادثات', val: stats.total, color: 'border-blue-500/20' },
            { label: 'كفاءة الذكاء الاصطناعي', val: `${Math.round((stats.automated/stats.total)*100) || 0}%`, color: 'border-emerald-500/20' },
            { label: 'التذاكر النشطة', val: stats.active, color:
