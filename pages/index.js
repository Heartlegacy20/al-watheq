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

export default function App() {
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
      setChatHistory(prev => [...prev, { role: 'ai', content: "خطأ في الاتصال." }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAlert(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden" dir="rtl">
      <Head><title>الواثق AI</title></Head>

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

      <main className="relative z-10 p-10 pointer-events-none">
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex justify-between items-center pointer-events-auto">
          <h1 className="text-xl font-bold italic">AL-WATHEQ AI</h1>
          <div className="text-xs font-mono text-blue-400">STATUS: ACTIVE</div>
        </div>
      </main>

      <div className="fixed bottom-8 left-8 z-[999] pointer-events-auto">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 w-80 h-[400px] mb-4 rounded-3xl flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-4 bg-blue-600 text-center text-[10px] font-bold tracking-widest uppercase">المساعد الذكي</div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatHistory.map((h, i) => (
                  <div key={i} className={`flex ${h.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`p-2 rounded-xl text-[10px] ${h.role === 'user' ? 'bg-blue-600' : 'bg-white/10 border border-white/5'}`}>{h.content}</div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-black/40 flex gap-2">
                <input 
                  value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-[10px] flex-1 outline-none"
                  placeholder="اسأل الواثق..."
                />
                <button onClick={sendMessage} className="bg-blue-600 px-3 rounded-lg text-xs">ارسل</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
          {isChatOpen ? "✕" : "🤖"}
        </button>
      </div>
    </div>
  );
}
