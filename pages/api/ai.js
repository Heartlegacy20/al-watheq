import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// إعداد العملاء باستخدام المفاتيح التي وضعتها في Vercel
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  // 1. تسجيل أن هناك اتصالاً قد وصل (سيظهر في Logs)
  console.log("!!! اتصال جديد وصل من WhatsApp !!!");
  console.log("بيانات الطلب:", req.body);

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // 2. استخراج الرسالة ورقم المرسل من تويلي
    const body = req.body;
    const message = body.Body;
    const sender = body.From;

    // 3. تحليل سريع بالـ AI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message || "مرحباً" }]
    });
    const aiReply = completion.choices[0].message.content;

    // 4. حفظ البيانات في Supabase
    const { error } = await supabase.from('tickets').insert([
      { 
        customer_name: sender, 
        last_message: message, 
        status: 'automated',
        ai_tag: 'WhatsApp Live'
      }
    ]);

    if (error) console.error("خطأ سوبابيس:", error);

    // 5. الرد الرسمي الذي يفهمه تويلي ليرسله للواتساب
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`
      <Response>
        <Message>${aiReply}</Message>
      </Response>
    `);

  } catch (err) {
    console.error("خطأ شامل في السيرفر:", err);
    return res.status(500).json({ error: err.message });
  }
}
