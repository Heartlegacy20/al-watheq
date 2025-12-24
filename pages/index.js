import Head from 'next/head'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [tickets, setTickets] = useState([])

  const fetchTickets = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .order('id', { ascending: false })
    if (data) setTickets(data)
  }

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans text-right" dir="rtl">
      <Head>
        <title>الواثق | نظام إدارة العملاء الذكي</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* القسم الأول: الهوية والترحيب (من الواجهة السابقة) */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-600">💡 الواثق</div>
        <div className="hidden md:flex gap-8 text-gray-600 font-medium">
          <a href="#" className="hover:text-blue-600">الرئيسية</a>
          <a href="#" className="hover:text-blue-600">التقارير</a>
          <a href="#" className="hover:text-blue-600">الإعدادات</a>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700 transition">
          تسجيل الخروج
        </button>
      </nav>

      <header className="py-12 px-6 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4">
          مرحباً بك في <span className="text-blue-600">نظام الواثق</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          هنا يمكنك إدارة جميع محادثات WhatsApp المباشرة ومراقبة أداء الذكاء الاصطناعي في الرد على عملائك.
        </p>
      </header>

      {/* القسم الثاني: لوحة البيانات التفاعلية (Dashboard) */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">التذاكر والرسائل الحية</h2>
              <p className="text-slate-500 text-sm mt-1">يتم التحديث تلقائياً من Supabase</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-bold text-green-600 italic">مباشر الآن</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase">
                  <th className="p-6 text-right font-bold">العميل</th>
                  <th className="p-6 text-right font-bold">آخر رسالة</th>
                  <th className="p-6 text-center font-bold">الحالة</th>
                  <th className="p-6 text-center font-bold">التصنيف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-blue-50/40 transition-all duration-300">
                    <td className="p-6">
                      <div className="font-bold text-slate-900">{ticket.customer_name}</div>
                      <div className="text-xs text-slate-400">ID: {ticket.id.slice(0,8)}</div>
                    </td>
                    <td className="p-6 text-slate-600 font-medium italic">
                      {ticket.last_message || "لا توجد رسالة بعد"}
                    </td>
                    <td className="p-6 text-center">
                      <span className="bg-emerald-100 text-emerald-700 py-1.5 px-4 rounded-full text-xs font-black uppercase">
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <span className="bg-blue-100 text-blue-700 py-1.5 px-4 rounded-full text-xs font-bold">
                        {ticket.ai_tag || "WhatsApp"}
                      </span>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-24 text-center">
                      <div className="text-slate-300 text-lg">بانتظار استقبال أول رسالة من الواتساب...</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="text-center py-10 border-t border-slate-100 text-slate-400 text-sm">
        جميع الحقوق محفوظة لنظام الواثق © 2025
      </footer>
    </div>
  )
}
