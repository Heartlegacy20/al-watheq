import Head from 'next/head';
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Environment, ContactShadows, PerspectiveCamera, Sphere, Torus } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// مكون "نواة الذكاء الاصطناعي" المطور
function AIQuantumCore({ isAlert }) {
  const coreRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) coreRef.current.rotation.y = t * 0.3;
    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * 0.5;
      ringRef1.current.rotation.z = t * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y = -t * 0.4;
      ringRef2.current.rotation.x = t * 0.1;
    }
  });

  return (
    <group>
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        {/* النواة المركزية المتوهجة */}
        <Sphere args={[1.2, 64, 64]} ref={coreRef}>
          <MeshDistortMaterial
            color={isAlert ? "#60a5fa" : "#3b82f6"}
            speed={4}
            distort={0.5}
            metalness={0.2}
            roughness={0.1}
            emissive={isAlert ? "#3b82f6" : "#1d4ed8"}
            emissiveIntensity={2}
          />
        </Sphere>
        
        {/* حلقات الطاقة المحيطة */}
        <Torus args={[2.2, 0.02, 16, 100]} ref={ringRef1}>
          <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={5} />
        </Torus>
        <Torus args={[2.5, 0.01, 16, 100]} ref={ringRef2} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </Torus>
      </Float>
      <pointLight position={[0, 0, 0]} intensity={3} color="#3b82f6" distance={15} />
    </group>
  );
}

export default function TacticalImmersiveDashboard() {
  const [stats, setStats] = useState({ total: 0, automated: 0, active: 0 });
  const [chartData, setChartData] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      if (data) {
        setStats({
          total: data.length,
          automated: data.filter(t => t.status === 'تم الرد').length,
          active: data.filter(t => t.status === 'انتظار' || t.status === 'نشط').length
        });

        // تجهيز بيانات الرسم البياني
        const mockChart = data.slice(0, 10).map((t, i) => ({
          name: i,
          activity: Math.floor(Math.random() * 40) + 60
        })).reverse();
        setChartData(mockChart);
      }
    };
    fetchData();
    const sub = supabase.channel('any').on('postgres_changes', { event: '*', table: 'tickets' }, fetchData).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const handleSend = async () => {
    if (!chatMessage.trim()) return;
    setIsLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: chatMessage }]);
    const msg = chatMessage;
    setChatMessage("");

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Body: msg, From: "Admin" }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "عذراً، النواة لا تستجيب حالياً." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 overflow-hidden relative font-sans" dir="rtl">
      <Head>
        <title>الواثق AI | Tactical Command</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* 3D Immersive Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={40} />
          <Suspense fallback={null}>
            <AIQuantumCore isAlert={isLoading} />
            <Environment preset="night" />
            <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Interface Layer */}
      <div className="relative z-10 h-screen flex flex-col p-6 pointer-events-none">
        
        {/* Top Navbar */}
        <header className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40 font-black">W</div>
            <h1 className="text-xl font-bold tracking-tighter uppercase italic">Al-Watheq Tactical AI</h1>
          </div>
          <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 animate-pulse">
            CORE STATUS: OPERATIONAL
          </div>
        </header>

        {/* Main Content: Stats & Charts */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden pb-20">
          
          {/* Stats Side Grid */}
          <div className="flex flex-col gap-4 pointer-events-auto">
            {[
              { label: 'إجمالي العمليات', val: stats.total, color: 'from-blue-600/20' },
              { label: 'الاستجابة الذكية', val: stats.automated, color: 'from-emerald-600/20' },
              { label: 'الأهداف النشطة', val: stats.active, color: 'from-amber-600/20' }
            ].map((s, i) => (
              <motion.div key={i} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                className={`bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] bg-gradient-to-br ${s.color} to-transparent`}
              >
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">{s.label}</p>
                <h3 className="text-4xl font-black">{s.val}</h3>
              </motion.div>
            ))}
          </div>

          {/* Interactive Chart Area */}
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="lg:col-span-3 bg-slate-900/30 backdrop-blur-md border border-white/5 p-8 rounded-[3rem] pointer-events-auto flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                مؤشر النشاط الحي
              </h2>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '15px'}} />
                  <Area type="monotone" dataKey="activity" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAct)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Floating Chat Bot */}
        <div className="fixed bottom-10 left-10 z-50 pointer-events-auto">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 w-80 h-[450px] mb-6 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-5 bg-blue-600/20 border-b border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Core Interface</span>
                  <button onClick={() => setIsChatOpen(false)}>✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 text-right">
                  {chatHistory.map((h, i) => (
                    <div key={i} className={`flex ${h.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`p-3 rounded-2xl text-[11px] max-w-[85%] ${h.role === 'user' ? 'bg-blue-600' : 'bg-white/5 border border-white/10'}`}>
                        {h.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && <div className="text-blue-400 text-[10px] animate-pulse">جاري التحليل...</div>}
                </div>
                <div className="p-4 bg-black/40 flex gap-2">
                  <input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="تحدث مع النواة..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs flex-1 outline-none focus:border-blue-500"
                  />
                  <button onClick={handleSend} className="bg-blue-600 p-2 rounded-xl">🤖</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
             {isChatOpen ? "✕" : "🤖"}
          </button>
        </div>
      </div>
      <style jsx global>{`
        body { margin: 0; background: #020617; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}
