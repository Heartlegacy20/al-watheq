import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  // للتعامل مع الطلبات من الواجهة الأمامية (Chat Widget)
  if (req.method === 'GET') {
    return res.status(200).send("الواثق AI Assistant جاهز للعمل!");
  }

  if (req.method === 'POST') {
    const { Body, From } = req.body;

    try {
      // 1. جلب تعليمات الشركة (المرونة التي طلبتها)
      const { data: config, error: configError } = await supabase
        .from('settings')
        .select('instructions')
        .single();

      if (configError) console.error("لم يتم العثور على إعدادات الشركة، سيتم استخدام الرد الافتراضي.");

      // 2. إرسال الرسالة للـ AI مع تفعيل ميزة "الوظائف" (Tools)
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { 
            role: "system", 
            content: config?.instructions || "أنت مساعد ذكي لنظام الواثق. أجب باختصار ولباقة." 
          },
          { role: "user", content: Body }
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_appointment",
            description: "حجز موعد جديد للعميل في قاعدة البيانات",
            parameters: {
              type: "object",
              properties: {
                date: { type: "string", description: "التاريخ والوقت المطلوب للحجز" },
                details: { type: "string", description: "نوع الخدمة أو تفاصيل إضافية" }
              },
              required: ["date"]
            }
          }
        }],
        tool_choice: "auto"
      });

      const aiMessage = response.choices[0].message;

      // 3. معالجة طلب الحجز إذا قرر الـ AI ذلك
      if (aiMessage.tool_calls) {
        const toolCall = aiMessage.tool_calls[0];
        if (toolCall.function.name === "create_appointment") {
          const params = JSON.parse(toolCall.function.arguments);
          
          // تنفيذ الحجز في جدول appointments
          const { error: insertError } = await supabase.from('appointments').insert([
            { 
              customer_name: From || "عميل موقع", 
              date: params.date, 
              service: params.details || "غير محدد" 
            }
          ]);

          if (insertError) throw new Error("فشل الحجز في قاعدة البيانات");

          return res.status(200).json({ 
            reply: `تم تأكيد حجزك بنجاح في تاريخ ${params.date}. يسعدنا خدمتك!` 
          });
        }
      }

      // 4. إذا كان سؤالاً عادياً، نخزن المحادثة في جدول tickets لمراقبتها من الـ Dashboard
      await supabase.from('tickets').insert([
        { 
          customer_name: From || "زائر الموقع", 
          last_message: Body, 
          ai_reply: aiMessage.content, 
          status: 'تم الرد' 
        }
      ]);

      return res.status(200).json({ reply: aiMessage.content });

    } catch (e) {
      console.error("خطأ في المساعد الذكي:", e.message);
      return res.status(500).json({ error: "حدث خطأ فني، حاول مرة أخرى لاحقاً." });
    }
  }
}
