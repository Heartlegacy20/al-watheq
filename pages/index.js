import Head from 'next/head';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// إعداد Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// الدالة الرئيسية لمكون لوحة القيادة
export default function UltimateDashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, automated: 0, pending: 0, today: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات والإحصائيات من Supabase
  const fetchData = async () => {
    setLoading(true);
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false }); // ترتيب حسب تاريخ الإنشاء

    if (ticketsError) {
      console.error("Error fetching tickets:", ticketsError);
      setLoading(false);
      return;
    }

    if (ticketsData) {
      setTickets(ticketsData);

      // حساب الإحصائيات
      const today = new Date().toISOString().split('T')[0];
      const dailyTickets = ticketsData.filter(t => t.created_at.startsWith(today)).length;

      setStats({
        total: ticketsData.length,
        automated: ticketsData.filter(t => t.status === 'تم الرد' || t.status === 'automated').length,
        pending: ticketsData.filter(t => t.status === 'انتظار').length,
        today: dailyTickets
      });

      // إعداد بيانات الرسم البياني
      const dayCounts = ticketsData.reduce((acc, ticket) => {
        const date = ticket.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const sortedDates = Object.keys(dayCounts).sort();
      const chartFormattedData = sortedDates.map(date => ({
        name: new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
        محادثات: dayCounts[date],
      }));
      setChartData(chartFormattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 7000); // تحديث كل 7 ثوانٍ
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans overflow-hidden relative" dir="rtl">
      <Head>
        <title>الواثق | لوحة التحكم المتكاملة</title>
        <script src="https://cdn.tailwindcss.com"></script>
        {/* رابط الخطوط إذا أردت خطوطا معينة */}
        {/* <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet" /> */}
        <style>
          {`
          /* خلفية متحركة وهمية (CSS Animation) */
          body {
            overflow: hidden; /* لمنع ظهور شريط التمرير الناتج عن الخلفية المتحركة */
          }
          .background-animation::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 300%;
            height: 300%;
            background: linear-gradient(45deg, #1f2937, #0f172a, #1f2937, #0f172a);
            background-size: 200% 200%;
            animation: moveBackground 30s ease infinite alternate;
            z-index: -1;
            opacity: 0.1; /* شفافية بسيطة للخلفية */
          }

          @keyframes moveBackground {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          `}
        </style>
      </Head>

      {/* الخلفية المتحركة (Pseudo-element) */}
      <div className="absolute inset-0 background-animation"></div>

      {/* الشريط العلوي (Navbar) */}
      <nav className="sticky top-0 z-50 bg-gray-800/70 backdrop-blur-sm border-b border-gray-700 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* شعار الواثق */}
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white text-xl font-black">W</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide">الواثق <span className="text-blue-400 text-base font-medium">| لوحة قيادة CRM</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-400">مرحباً بك، المدير!</span>
            <div className="flex items-center gap-2 bg-green-700/30 px-4 py-2 rounded-full border border-green-600">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-bold text-green-300">النظام متصل</span>
            </div>
            <button className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition">
              تسجيل الخروج
            </button>
          </div>
        </div>
      </nav>

      {/* المحتوى الرئيسي */}
      <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-10">
        
        {/* البطاقات الإحصائية */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card title="إجمالي المحادثات" value={stats.total} color="blue" icon="💬" loading={loading} />
          <Card title="محادثات اليوم" value={stats.today} color="green" icon="☀️" loading={loading} />
          <Card title="تم الرد آلياً" value={stats.automated} color="purple" icon="🤖" loading={loading} />
          <Card title="بانتظار المراجعة" value={stats.pending} color="yellow" icon="⚠️" loading={loading} />
        </div>

        {/* قسم الرسم البياني والجدول */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الرسم البياني */}
          <div className="lg:col-span-2 bg-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-900/40 border border-gray-700 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6">نشاط المحادثات اليومي</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-500">جاري تحميل الرسم البياني...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a55
