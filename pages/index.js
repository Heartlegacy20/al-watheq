import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-8 font-sans" dir="rtl">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">💡 نظام الواثق - لوحة القيادة</h1>
        <div className="bg-blue-100 p-2 rounded">خطة MVP - الأسبوع 1</div>
      </header>

      {/* بطاقات مؤشرات الأداء حسب مقترح المعماري [cite: 109, 180] */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="p-6 bg-white shadow-lg rounded-xl border-r-8 border-blue-500">
          <h3 className="text-gray-500">معدل التغطية الآلية</h3>
          <p className="text-3xl font-bold text-blue-600">70%</p>
        </div>
        <div className="p-6 bg-white shadow-lg rounded-xl border-r-8 border-green-500">
          <h3 className="text-gray-500">زمن الرد الأول (Avg FRT)</h3>
          <p className="text-3xl font-bold text-green-600">1.2 دقيقة</p>
        </div>
        <div className="p-6 bg-white shadow-lg rounded-xl border-r-8 border-yellow-500">
          <h3 className="text-gray-500">التذاكر المفتوحة</h3>
          <p className="text-3xl font-bold text-yellow-600">12</p>
        </div>
        <div className="p-6 bg-white shadow-lg rounded-xl border-r-8 border-red-500">
          <h3 className="text-gray-500">التذاكر المُصَعَّدة</h3>
          <p className="text-3xl font-bold text-red-600">3</p>
        </div>
      </div>

      <div className="bg-white p-6 shadow rounded-xl">
        <h2 className="text-xl font-bold mb-4">أحدث تذاكر WhatsApp [cite: 117, 201]</h2>
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 border-b">العميل</th>
              <th className="p-3 border-b">التصنيف الآلي</th>
              <th className="p-3 border-b">الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border-b">أحمد محمد</td>
              <td className="p-3 border-b">استفسار مالي</td>
              <td className="p-3 border-b"><span className="bg-green-100 text-green-700 px-2 py-1 rounded">رد آلي</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}