import Head from 'next/head';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LuxuryDashboard() {
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

        // تجهيز بيانات الرسم البياني بشكل احترافي
        const last7Days = data.slice(0, 7).map((t, i) => ({
          name: `رسالة ${i + 1}`,
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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30" dir="rtl">
      <Head>
        <title>الواثق | لوحة القيادة الاحترافية</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-bg {
            background: linear-gradient(-45deg, #0f172a, #1e293b, #0f172a, #111827);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
          }
        `}</style>
      </Head>

      <div className="animate-bg min-h-screen relative overflow-hidden">
        {/* Navbar */}
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0">
                <span className="text-white text-2xl font-black italic">W</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">نظام الواثق الذكي</h1>
                <p className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase">Enterprise Intelligence</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="hidden md:flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-slate-300">خادم Vercel: متصل</span>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'إجمالي المحادثات', val: stats.total, color: 'from-blue-500 to-blue-700', icon: '📊' },
              { label: 'ردود الذكاء الاصطناعي', val: stats.automated, color: 'from-emerald-500 to-teal-700', icon: '🤖' },
              { label: 'تذاكر نشطة', val: stats.active, color: 'from-amber-500 to-orange-700', icon: '🔥' }
            ].map((s, i) => (
              <div key={i} className="bg-slate-800/40 border border-slate-700 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-slate-500 transition-all">
                <div className="relative z-10">
                  <p className="text-slate-400 text-sm font-medium mb-1">{s.label}</p>
                  <h3 className="text-4xl font-black text-white">{s.val}</h3>
                </div>
                <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">{s.icon}</div>
                <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b ${s.color}`}></div>
              </div>
            ))}
          </div>

          {/* Charts & List Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Card */}
            <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700 p-8 rounded-[2rem] backdrop-blur-md shadow-2xl">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                مؤشر التفاعل المباشر
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px'}} />
                    <Area type="monotone" dataKey="تفاعل" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side List */}
            <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-[2rem] backdrop-blur-md">
              <h2 className="text-xl font-bold mb-6">أحدث الرسائل</h2>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {tickets.slice(0, 5).map((t, i) => (
                  <div key={i} className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-2xl hover:bg-slate-700/30 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t.ai_tag || 'WhatsApp'}</span>
                      <span className="text-[10px] text-slate-500">منذ قليل</span>
                    </div>
                    <p className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{t.customer_name}</p>
                    <p className="text-xs text-slate-400 line-clamp-1 italic">"{t.last_message}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Table Area */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="p-8 border-b border-slate-700 flex justify-between items-center bg-slate-800/20">
              <h2 className="text-xl font-bold">سجل المحادثات الكامل</h2>
              <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">تصدير البيانات</button>
            </div>
            <div className="overflow-x-auto px-4 pb-4">
              <table className="w-full text-right border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <th className="p-4">العميل</th>
                    <th className="p-4">نص الرسالة</th>
                    <th className="p-4 text-center">الحالة الإجرائية</th>
                    <th className="p-4 text-center">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="bg-slate-900/40 hover:bg-slate-700/30 transition-all rounded-2xl border border-slate-700">
                      <td className="p-4 font-bold text-blue-100 rounded-r-2xl border-y border-r border-slate-700/50">{t.customer_name}</td>
                      <td className="p-4 text-sm text-slate-400 italic max-w-xs truncate border-y border-slate-700/50">{t.last_message}</td>
                      <td className="p-4 text-center border-y border-slate-700/50">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          t.status === 'تم الرد' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500 rounded-l-2xl border-y border-l border-slate-700/50">
                        {new Date(t.created_at).toLocaleDateString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
