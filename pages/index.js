import Head from 'next/head'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans" dir="rtl">
      <Head>
        <title>الواثق - لوحة القيادة</title>
        {/* الخطوة ب: سحب مكتبة التنسيق Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-600">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">💡 نظام الواثق - لوحة القيادة</h1>
          <p className="text-gray-500 mt-1">مرحباً بك في نظام الدعم الفني الذكي</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold border border-blue-200">
          خطة MVP - الأسبوع 1
        </div>
      </header>

      {/* بطاقات مؤشرات الأداء الأساسية المذكورة في خطة العمل */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="p-6 bg-white shadow-xl rounded-2xl border-r-8 border-blue-600 transition-transform hover:scale-105">
          <h3 className="text-gray-500 font-medium">معدل التغطية الآلية</h3>
          <p className="text-4xl font-black text-blue-700 mt-2">70%</p>
          <div className="text-xs text-green-500 mt-2">↑ مستهدف الأسبوع 1</div>
        </div>
        
        <div className="p-6 bg-white shadow-xl rounded-2xl border-r-8 border-green-500 transition-transform hover:scale-105">
          <h3 className="text-gray-500 font-medium">زمن الرد الأول (Avg FRT)</h3>
          <p className="text-4xl font-black text-green-600 mt-2">1.2 دقيقة</p>
          <div className="text-xs text-gray-400 mt-2">ضمن النطاق المخطط</div>
        </div>

        <div className="p-6 bg-white shadow-xl rounded-2xl border-r-8 border-yellow-500 transition-transform hover:scale-105">
          <h3 className="text-gray-500 font-medium">التذاكر المفتوحة</h3>
          <p className="text-4xl font-black text-yellow-600 mt-2">12</p>
          <div className="text-xs text-red-400 mt-2">تحتاج تدخل بشري</div>
        </div>

        <div className="p-6 bg-white shadow-xl rounded-2xl border-r-8 border-red-500 transition-transform hover:scale-105">
          <h3 className="text-gray-500 font-medium">التذاكر المُصَعَّدة</h3>
          <p className="text-4xl font-black text-red-600 mt-2">3</p>
          <div className="text-xs text-gray-400 mt-2">بانتظار المشرف</div>
        </div>
      </div>

      <div className="bg-white p-8 shadow-2xl rounded-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 italic underline decoration-blue-500">أحدث تذاكر WhatsApp</h2>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm transition">تحديث البيانات</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
                <th className="p-4 border-b font-bold text-gray-700">العميل</th>
                <th className="p-4 border-b font-bold text-gray-700 text-center">التصنيف الآلي</th>
                <th className="p-4 border-b font-bold text-gray-700 text-center">الحالة</th>
                <th className="p-4 border-b font-bold text-gray-700">التوقيت</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              <tr className="hover:bg-blue-50 transition duration-200 border-b border-gray-100">
                <td className="p-4 font-bold text-gray-800">أحمد محمد</td>
                <td className="p-4 text-center">
                   <span className="bg-purple-100 text-purple-700 py-1 px-3 rounded-full text-xs font-bold italic">استفسار مالي</span>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold border border-green-200">رد آلي (AI)</span>
                </td>
                <td className="p-4 text-gray-400">منذ دقيقتين</td>
              </tr>
              <tr className="hover:bg-blue-50 transition duration-200">
                <td className="p-4 font-bold text-gray-800">سارة علي</td>
                <td className="p-4 text-center">
                   <span className="bg-yellow-100 text-yellow-700 py-1 px-3 rounded-full text-xs font-bold italic">توصيل / شحن</span>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-bold border border-blue-200">بانتظار الوكيل</span>
                </td>
                <td className="p-4 text-gray-400">منذ 5 دقائق</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <footer className="mt-12 text-center text-gray-400 text-sm">
        © 2025 مشروع الواثق - النسخة التجريبية (MVP)
      </footer>
    </div>
  );
}
