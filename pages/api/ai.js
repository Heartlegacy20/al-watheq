import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// 1. إعداد الاتصال بـ Supabase و OpenAI
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
})

export default async function handler(req, res) {
  // تسجيل وصول الطلب في Logs Vercel للتأكد من الربط
  console.log("--- تم استقبال طلب جديد من Twilio ---");

  // السماح فقط بطلبات POST (التي يرسلها تويلي)
  if (req.method !== 'POST') {
    console.log("خطأ: تم استقبال طلب ليس من نوع POST");
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 2. استخراج البيانات من Twilio (تصل بصيغة Form Data)
    const { Body, From } = req.body;
    
    console.log("المرسل:", From);
    console.log("الرسالة:", Body);

    // 3. الحصول على رد من ذكاء OpenAI الاصطناعي
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "أنت مساعد ذكي لمشروع الواثق، تجيب باختصار ومهنية." },
        { role: "user", content: Body || "مرحباً" }
      ]
    });
    
    const aiReply = completion.choices[0].message.content;
    console.log("رد الـ AI:", aiReply);

    // 4. تخزين التذكرة في جدول tickets في Supabase
    const { data, error: dbError } = await supabase
      .from('tickets')
      .insert([
        { 
          customer_name: From, 
          last_message: Body, 
          status: 'automated',
          ai_tag: 'WhatsApp' 
        }
      ]);

    if (dbError) {
      console.error("خطأ في تخزين البيانات في Supabase:", dbError.message);
    } else {
      console.log("تم تخزين التذكرة بنجاح في قاعدة البيانات");
    }

    // 5. الرد بتنسيق TwiML (الذي يفهمه تويلي لإرساله للواتساب)
    res.setHeader('Content-Type', 'text/xml');
    const twimlResponse = `
      <Response>
        <Message>${aiReply}</Message>
      </Response>
    `;
    return res.status(200).send(twimlResponse);

  } catch (error) {
    console.error("خطأ تقني في المعالجة:", error.message);
    return res.status(500).send("Internal Server Error");
  }
}
