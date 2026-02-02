import Head from 'next/head';
import { useEffect, useState, Suspense, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

// إعداد Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// مكون الدبابة "الواثق" - تصميم تجريدي فخم
function AlWatheqModel({ active }) {
  const meshRef = useRef();
  
  // حركة دورانية بسيطة تعطي إحساس بالحياة
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t / 4) / 4;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={meshRef}>
        {/* جسم الدبابة الأساسي */}
        <mesh castShadow>
          <boxGeometry args={[3.5, 0.8, 5]} />
          <MeshDistortMaterial 
            color={active ? "#3b82f6" : "#1e293b"} 
            speed={3} 
            distort={0.1} 
            metalness={1} 
            roughness={0.1} 
          />
        </mesh>
        {/* برج الدبابة والمدفع */}
        <mesh position={[0, 0.8, 0.5]} castShadow>
          <boxGeometry args={[2, 0.6, 2.5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.8, 3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 3]} />
          <meshStandardMaterial color="#334155" metalness={1} />
        </mesh>
      </group>
    </Float>
  );
}

export default function AlWatheqDashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, automated: 0, active: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      if (data) {
        setTickets(data);
        setStats({
          total: data.length,
          automated: data.filter(t => t.status === 'تم الرد').length,
          active: data.filter(t => t.status === 'انتظار').length
        });

        const last7Days = data.slice(0, 7).map((t, i) => ({
          name: `R${i + 1}`,
          تفاعل: Math.floor(Math.random() * 100) + 50 
        })).reverse();
        setChartData(last7Days);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden" dir="rtl">
      <Head>
        <title>الواثق | الرؤية التكتيكية 3D</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* خلفية الـ 3D التي تشغل الشاشة */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas shadows camera={{ position: [0, 5, 12], fov: 40 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
            <AlWatheqModel active={stats.active > 0} />
            <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
            <Environment preset="night" />
            <OrbitControls enableZoom={false} makeDefault />
          </Suspense>
        </Canvas>
      </div>

      {/* واجهة المستخدم الطافية (UI Layer) */}
      <div className="relative z-10 flex flex-col h-screen overflow-y-auto custom-scrollbar p-6">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)]">
              <span className="font-black italic">W</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AL-WATHEQ INTELLIGENCE</h1>
              <p className="text-[9px] text-blue-400 font-bold tracking-widest uppercase text-left">Tactical Interface v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-[10px] text-green-400 font-bold">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            CONNECTED TO SUPABASE
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'إجمالي العمليات', val: stats.total, icon: '⚡' },
            { label: 'الاستجابة الآلية', val: stats.automated, icon: '🤖' },
            { label: 'الأهداف النشطة', val: stats.active, icon: '🎯' }
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all group"
            >
              <p className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-tighter">{s.label}</p>
              <h3 className="text-3xl font-black">{s.val}</h3>
              <div className="absolute top-4 left-4 opacity-20 group-hover:opacity-100 transition-opacity">{s.icon}</div>
            </motion.div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem]">
            <h2 className="text-sm font-bold mb-6 flex items-center gap-2 text-blue-400 uppercase">
               <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
               مؤشر التهديدات والنشاط المباشر
            </h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <Tooltip contentStyle={{backgroundColor: '#0f172a', borderRadius: '15px', border: '1px solid #1e293b'}} />
                  <Area type="monotone" dataKey="تفاعل" stroke="#3b82f6" fill="url(#colorUsage)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Latest Messages */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem]">
            <h2 className="text-sm font-bold mb-6 text-slate-400">آخر الاتصالات</h2>
            <div className="space-y-4">
              {tickets.slice(0, 3).map((t, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs font-bold text-blue-400 mb-1">{t.customer_name}</p>
                  <p className="text-[10px] text-slate-400 italic truncate">"{t.last_message}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-auto pt-6 border-t border-white/5 text-[9px] text-slate-600 flex justify-between uppercase tracking-[0.3em]">
          <span>Project: Al-Watheq Tactical System</span>
          <span>Status: Battle Ready</span>
        </footer>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        @keyframes pulse-blue { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
