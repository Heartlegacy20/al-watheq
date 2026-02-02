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
    if (group.current) group.current.rotation.y = t * 0.1;
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

export default function AlWatheqApp() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAlert, setIsAlert] = useState(false);

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    setIsLoading(true);
    setIsAlert(true);
    setChatHistory(prev => [...prev, { role: 'user', content: chatMessage }]);
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
      setChatHistory(prev => [...prev, { role: 'ai', content: "خطأ في الاتصال." }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAlert(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative" dir="rtl">
      <Head>
        <title>الواثق AI | Tactical System</title>
        {/* هذا الرابط سيصلح كل مشاكل التصميم فوراً */}
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* محرك الـ 3D - خلفية كاملة */}
      <div className="absolute inset-0 z-0 bg-[#020617]">
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

      {/* واجهة المستخدم الطافية */}
      <nav className="relative z-10 p-8 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-blue-500/20">W</div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">AL-WATHEQ AI</h1>
        </div>
        <div className="px-4 py-1 rounded-full border border-blue-500/30 text-[10px] font-bold text-blue-400 bg-blue-500/5 uppercase tracking-widest animate-pulse">
          Status: Tactical Active
        </div>
      </nav>

      {/* زر الدردشة والنافذة */}
      <div className="fixed bottom-10 left-10 z-[100]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 w-80 h-[450px] mb-6 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
            >
              <div className="p-5 bg-blue-600/20 border-b border-white/5 text-center text-[10px] font-bold tracking-widest text-blue-400">AI TACTICAL ASSISTANT</div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chatHistory.map((h, i) => (
                  <div key={i} className={`flex ${h.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[85%] ${h.role === 'user' ? 'bg-blue-600 shadow-lg' : 'bg-white/5 border border-white/10'}`}>
                      {h.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-black/40 flex gap-2">
                <input 
                  value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="اسأل الواثق..."
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[11px] flex-1 outline-none focus:border-blue-500 transition-all"
                />
                <button onClick={sendMessage} className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all">🤖</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
          {isChatOpen ? "✕" : "🤖"}
        </button>
      </div>
    </div>
  );
}
