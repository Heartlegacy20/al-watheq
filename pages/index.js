import Head from 'next/head';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Home() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, automated: 0 });

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase.from('tickets').select('*').order('id', { ascending: false });
      if (data) {
        setTickets(data);
        setStats({ total: data.length, automated: data.filter(t => t.status === 'تم الرد').length });
      }
    };
    fetchItems();
    const interval = setInterval(fetchItems, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-5" dir="rtl">
      <Head><title>الواثق CRM</title><script src="https://cdn.tailwindcss.com"></script></Head>
      
      {/* الهيدر */}
      <div className="flex justify-between items-center mb-10 bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl">W</div>
          <h1 className="text-2xl font-bold">نظام الواثق الذكي</h1>
        </div>
        <div className="bg-green-900/30 text-green-400 px-4 py-2 rounded-full border border-green-800 animate-pulse">متصل الآن</div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 text-center">
          <p className="text-gray-400 mb-2">إجمالي المحادثات</p>
          <span className="text-5xl font-black text-blue-500">{stats.total}</span>
        </div>
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 text-center">
          <p className="text-gray-400 mb-2">تم الرد آلياً</p>
          <span className="text-5xl font-black text-green-500">{stats.automated}</span>
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
        <table className="w-full text-right">
          <thead className="bg-gray-700/50 text-gray-400 uppercase text-xs">
            <tr>
              <th className="p-5">العميل</th>
              <th className="p-5">الرسالة</th>
              <th className="p-5 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {tickets.map(t => (
              <tr key={t.id} className="hover:bg-gray-700/30 transition">
                <td className="p-5 font-bold">{t.customer_name}</td>
                <td className="p-5 text-gray-300">{t.last_message}</td>
                <td className="p-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${t.status === 'تم الرد' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
