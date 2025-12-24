import Head from 'next/head'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [tickets, setTickets] = useState([])

  const fetchTickets = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .order('id', { ascending: false }) // عرض الأحدث في الأعلى
    if (data) setTickets(data)
  }

  useEffect(() => {
    fetchTickets()
    // تحديث تلقائي كل 5 ثوانٍ لرؤية الرسائل فور وصولها
    const interval = setInterval(fetchTickets, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans" dir="rtl">
      <Head>
        <title>الواثق | إدارة التذاكر</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border-r-8 border-blue-600">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🚀 نظام الواثق - مباشر</h1>
          <p className="text-slate-500 text-sm">يتم التحديث تلقائياً عند وصول رسائل WhatsApp</p>
        </div>
        <div className="text-left">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">متصل الآن</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-700">التذاكر الواردة</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="text-slate-400 text-sm uppercase">
                <th className="p-5 font-semibold">العميل</th>
                <th className="p-5 font-semibold">آخر رسالة</th>
                <th className="p-5 font-semibold text-center">التصنيف</th>
                <th className="p-5 font-semibold text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-5 font-bold text-blue-900">{ticket.customer_name}</td>
                  <td className="p-5 text-slate-600 max-w-xs truncate">{ticket.last_message}</td>
                  <td className="p-5 text-center">
                    <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-lg text-xs font-medium">
                      {ticket.ai_tag || 'WhatsApp'}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <span className="bg-emerald-100 text-emerald-700 py-1 px-3 rounded-lg text-xs font-bold">
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-slate-400">بانتظار وصول أول رسالة من واتساب...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
