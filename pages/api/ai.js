import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send("الواثق AI API يعمل بنجاح!");
  }

  if (req.method === 'POST') {
    const { Body, From } = req.body; // Body هو نص رسالة العميل

    try {
      // 1. استدعاء الذكاء الاصطناعي لتحليل الرسالة والرد عليها
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { 
            role: "system", 
            content: "أنت المساعد الذكي لنظام الواثق. وظيفتك الرد على العملاء بلباقة، حجز مواعيد إذا طلبوا ذلك، وتصنيف طلباتهم. أنت تمثل شركة (ضع اسم الشركة هنا)." 
          },
          { role: "user", content: Body }
        ],
      });

      const replyText = aiResponse.choices[0].message.content;

      // 2. تخزين البيانات في Supabase مع رد الذكاء الاصطناعي
      await supabase.from('tickets').insert([
        { 
          customer_name: From, 
          last_message: Body, 
          ai_reply: replyText, // عمود جديد لتخزين رد الـ AI
          status: 'تم الرد آلياً', 
          ai_tag: 'AI-Assistant' 
        }
      ]);

      // 3. إرجاع الرد للعميل (إذا كنت تربطه بواتساب مثلاً)
      return res.status(200).json({ reply: replyText });

    } catch (e) {
      console.error(e);
      return res.status(500).send("حدث خطأ في معالجة الذكاء الاصطناعي");
    }
  }
}
