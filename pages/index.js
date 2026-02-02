import Head from 'next/head';
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function AlWatheqTank({ isAlert }) {
  const group = useRef();
  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.getElapsedTime() * 0.1;
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* جسم الدبابة الفولاذي */}
        <mesh castShadow>
          <boxGeometry args={[4, 1, 5.5]} />
          <meshStandardMaterial color={isAlert ? "#1e40af" : "#0f172a"} metalness={1} roughness={0.1} />
        </mesh>
        {/* البرج والمدفع */}
        <mesh position={[0, 0.8, 0.5]}>
          <boxGeometry args={[2.2, 0.8, 2.8]} />
          <MeshDistortMaterial color="#1e293b" speed={isAlert ? 4 : 1} distort={0.1} metalness={1} />
        </mesh>
        <mesh position={[0, 0.8, 3.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 4]} />
          <meshStandardMaterial color="#334155" metalness={1} />
        </mesh>
      </Float>
    </group>
  );
}

export default function FinalDashboard() {
  const [stats, setStats] = useState({ total: 0, automated: 0, active: 0 });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSend = async () => {
    if (!chatMessage.trim()) return;
    setIsLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: chatMessage }]);
    const currentMsg = chatMessage;
    setChatMessage("");

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Body: currentMsg, From: "Admin" }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "عذراً، النظام مشغول حالياً." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-hidden relative" dir="rtl">
      <Head>
        <title>الواثق | الإمبراطورية الذكية</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[10, 6, 15]} fov={35} />
          <Suspense fallback={null}>
            <AlWatheqTank isAlert={isLoading} />
            <Environment preset="night" />
            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={2} />
            <OrbitControls enableZoom={false} />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 p-8 h-screen flex flex-col justify-between pointer-events-none">
        {/* Header */}
        <motion.header initial={{ y: -50 }} animate={{ y: 0 }} className="flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)]">W</div>
            <h1 className="text-2xl font-black tracking-widest italic uppercase">Al-Watheq AI</h1>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 rounded-2xl text-[10px] font-bold tracking-[0.3em] text-blue-400">
             SYSTEM STATUS: TACTICAL ACTIVE
          </div>
        </motion.header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pointer-events-auto mb-10">
          {[
            { label: 'إجمالي العمليات', val: stats.total, color: 'border-blue-500/30' },
            { label: 'الاستجابة الذكية', val: stats.automated, color: 'border-emerald-500/30' },
            { label: 'الأهداف النشطة', val: stats.active, color: 'border-amber-500/30' }
          ].map((s, i) => (
            <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`bg-slate-900/40 backdrop-blur-xl border-l-4 ${s.color} p-6 rounded-3xl shadow-2xl`}
            >
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">{s.label}</p>
              <h3 className="text-4xl font-black tracking-tighter">{s.val}</h3>
            </motion.div>
          ))}
        </div>

        {/* Chat Interface (Left Side) */}
        <div className="fixed bottom-10 left-10 z-[100] pointer-events-auto">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 w-[380px] h-[500px] mb-6 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-6 bg-blue-600/20 border-b border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-blue-400">Imperial Assistant</span>
                  <button onClick={() => setIsChatOpen(false)} className="text-xs">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 text-right">
                  {chatHistory.map((h, i) => (
                    <div key={i} className={`flex ${h.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`p-3 rounded-2xl text-[11px] max-w-[80%] ${h.role === 'user' ? 'bg-blue-600 shadow-lg' : 'bg-white/5 border border-white/10'}`}>
                        {h.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && <p className="text-[10px] text-blue-400 animate-pulse">جاري المعالجة...</p>}
                </div>
                <div className="p-4 bg-black/40 flex gap-2">
                  <input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="أمرك يا جلالة الإمبراطور..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs flex-1 outline-none focus:border-blue-500"
                  />
                  <button onClick={handleSend} className="bg-blue-600 p-2 rounded-xl">🤖</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            {isChatOpen ? "✕" : "🤖"}
          </button>
        </div>
      </div>
    </div>
  );
}
