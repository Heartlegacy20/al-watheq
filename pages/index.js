import Head from 'next/head';
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// إعداد Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// مكون مشهد الخلفية 3D (الدبابة الواثق)
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
          <MeshDistortMaterial 
            color={isAlert ? "#3b82f6" : "#1e293b"} 
            speed={isAlert ? 5 : 2} 
            distort={isAlert ? 0.4 : 0.1} 
            metalness={1} 
          />
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
  const [notifications, setNotifications] = useState([]);
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    // 1. جلب البيانات الأولية
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

    // 2. تفعيل المراقبة الحية (Realtime)
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'INSERT', table: 'tickets' }, 
        (payload) => {
          // تحديث الإحصائيات
          setStats(prev => ({ ...prev, total: prev.total + 1, active: prev.active + 1 }));
          
          // إضافة تنبيه جديد للقائمة
          const newNotif = { id: Date.now(), msg: payload.new.customer_name, text: payload.new.last_message };
          setNotifications(prev => [newNotif, ...prev]);
          
          // تفعيل تأثير التنبيه على الدبابة
          setIsAlert(true);
          setTimeout(() => setIsAlert(false), 3000);

          // حذف التنبيه تلقائياً بعد 5 ثواني
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
          }, 5000);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">
      <Head>
        <title>الواثق | لوحة التحكم الحية 3D</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* شاشة الـ 3D الخلفية */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[8, 5, 15]} fov={35} />
          <Suspense fallback={null}>
            <SceneBackground isAlert={isAlert} />
            <Environment preset="night" />
            <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={20} blur={2.5} far={4} />
            <OrbitControls enableZoom={false} autoRotate={!isAlert} autoRotateSpeed={0.5} />
          </Suspense>
        </Canvas>
      </div>

      {/* واجهة التنبيهات (Notifications Layer) */}
      <div className="fixed top-24 left-6 z-50 flex flex-col gap-4 w-80">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div 
              key={n.id}
              initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}
              className="bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 p-4 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-black uppercase text-blue-400">رسالة جديدة</span>
              </div>
              <p className="text-xs font-bold text-white">{n.msg}</p>
              <p className="text-[10px] text-slate-300 italic truncate mt-1">"{n.text}"</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* واجهة المستخدم الرئيسية */}
      <main className="relative z-10 container mx-auto px-6 py-12 pointer-events-none" dir="rtl">
        <motion.nav 
          initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] mb-12 pointer-events-auto"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <span className="text-2xl font-black italic">W</span>
            </div>
            <h1 className="text-xl font-black">الواثق | Tactical View</h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-300">LIVE FEED</span>
          </div>
        </motion.nav>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 pointer-events-auto">
          {[
            { label: 'إجمالي المحادثات', val: stats.total, color: 'border-blue-500/20' },
            { label: 'ردود المساعد AI', val: stats.automated, color: 'border-emerald-500/20' },
            { label: 'تذاكر نشطة', val: stats.active, color: 'border-amber-500/20' }
          ].map((s, i) => (
            <motion.div 
              key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`bg-slate-900/40 backdrop-blur-xl border ${s.color} p-8 rounded-[3rem] shadow-xl hover:bg-white/5 transition-all`}
            >
              <p className="text-slate-400 text-[10px] font-bold mb-2 uppercase tracking-widest">{s.label}</p>
              <h3 className="text-5xl font-black text-white">{s.val}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pointer-events-auto">
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-black/20 backdrop-blur-3xl border border-white/5 p-10 rounded-[3.5rem]">
            <h2 className="text-2xl font-bold mb-6 italic">تحليل الأنظمة</h2>
            <div className="space-y-4">
               <div className="w-full bg-white/5 h-12 rounded-2xl border border-white/5 flex items-center px-4 justify-between">
                  <span className="text-xs text-slate-400 text-left uppercase">Neural Engine</span>
                  <span className="text-xs text-blue-400 font-bold">ACTIVE</span>
               </div>
               <div className="w-full bg-white/5 h-12 rounded-2xl border border-white/5 flex items-center px-4 justify-between">
                  <span className="text-xs text-slate-400 text-left uppercase">Database Sync</span>
                  <span className="text-xs text-emerald-400 font-bold">SYNCHRONIZED</span>
               </div>
            </div>
          </motion.div>
          
          <div className="flex flex-col justify-center text-right">
             <h2 className="text-5xl font-black leading-tight mb-4 tracking-tighter uppercase">سيطرة مطلقة <br/><span className="text-blue-500">بذكاء اصطناعي</span></h2>
             <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                نظام الواثق يراقب، يحلل، ويستجيب لعملائك في الوقت الحقيقي. هذه هي النسخة التكتيكية المخصصة للمديرين.
             </p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        body { background: #020617; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
}
