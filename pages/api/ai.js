import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { Body, From } = req.body;

    try {
      // 1. جلب تعليمات الشركة (المرونة)
      const { data: config } = await supabase.from('settings').select('instructions').single();
      
      // 2. إرسال الرسالة للـ AI مع تفعيل ميزة "الوظائف" (Functions)
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: config.instructions || "أنت مساعد ذكي عام." },
          { role: "user", content: Body }
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_appointment",
            description: "حجز موعد للعميل في قاعدة البيانات",
            parameters: {
              type: "object",
              properties: {
                date: { type: "string", description: "التاريخ والوقت" },
                details: { type: "string", description: "تفاصيل الخدمة" }
              }
            }
          }
        }]
      });

      const message = response.choices[0].message;

      // 3. التحقق إذا كان الـ AI قرر "الحجز"
      if (message.tool_calls) {
        const action = message.tool_calls[0].function;
        if (action.name === "create_appointment") {
          const params = JSON.parse(action.arguments);
          
          // تنفيذ الحجز في Supabase
          await supabase.from('appointments').insert([
            { customer_name: From, date: params.date, service: params.details }
          ]);

          return res.status(200).json({ reply: `تمت جدولة موعدك بنجاح في ${params.date}.` });
        }
      }

      // 4. إذا كان مجرد سؤال عادي، نخزن الرد ونرسله
      await supabase.from('tickets').insert([
        { customer_name: From, last_message: Body, ai_reply: message.content, status: 'تم الرد' }
      ]);

      return res.status(200).json({ reply: message.content });

    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
}
