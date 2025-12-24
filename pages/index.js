import Head from 'next/head'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EnhancedDashboard() {
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState({ total: 0, automated: 0, pending: 0 })

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('id', { ascending: false })
    
    if (data) {
      setTickets(data)
      // تحديث الإحصائيات بناءً على البيانات الواردة
      setStats({
        total: data.length,
        automated: data.filter(t => t.status === 'تم الرد' || t.status === 'automated').length,
        pending: data.filter(t => t.status === 'انتظار').length
      })
    }
  }

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 4000) // تحديث سريع كل 4 ثوانٍ
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-right" dir="rtl">
      <Head>
        <title>الواثق | لوحة التحكم الذكية</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* الشريط العلوي المحسن */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
              <span className="text-white font-black">W</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">الواثق <span className="text-blue-600 text-sm font-normal">CRM</span></h1>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
             <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                <span className="text-xs font-bold text-green-600">النظام متصل</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        
        {/* قسم الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-transform hover:scale-105">
            <p className="text-slate-400 text-sm font-medium">إجمالي المحادثات</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.total}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-r-4 border-r-blue-500 transition-transform hover:scale-105">
            <p className="text-slate-400 text-sm font-medium">تم الرد عليها آلياً</p>
            <h3 className="text-3xl font-black text-blue-600 mt-1">{stats.automated}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-r-4 border-r-amber-500 transition-transform hover:scale-105">
            <p className="text-slate-400 text-sm font-medium">بانتظار المراجعة</p>
            <h3 className="text-3xl font-black text-amber-600 mt-1">{stats.pending}</h3>
          </div>
        </div>

        {/* الجدول التفاعلي المحسن */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-700">المحادثات المباشرة</h2>
            <button className="text-blue-600 text-sm font-bold hover:underline">تحميل التقرير</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-slate-400 text-xs font-bold text-right border-b border-slate-50">
                  <th className="p-6">العميل</th>
                  <th className="p-6">آخر رسالة من WhatsApp</th>
                  <th className="p-6 text-center">التصنيف الذكي</th>
                  <th className="p-6 text-center">حالة الرد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="group hover:bg-blue-50/30 transition-all">
                    <td className="p-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {ticket.customer_name?.slice(-2)}
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{ticket.customer_name}</span>
                    </td>
                    <td className="p-6 text-slate-600 text-sm italic max-w-md">
                      {ticket.last_message || "—"}
                    </td>
                    <td className="p-6 text-center">
                      <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-md text-[10px] font-black tracking-widest uppercase">
                        {ticket.ai_tag || 'عام'}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <div className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold ${
                        ticket.status === 'تم الرد' || ticket.status === 'automated' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ticket.status === 'تم الرد' || ticket.status === 'automated' ? '✅ ذكي' : '🕒 انتظار'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tickets.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full mb-4 animate-bounce flex items-center justify-center">📥</div>
                <p className="text-slate-400 font-medium">بانتظار استقبال أول طلب مكملات غذائية...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
