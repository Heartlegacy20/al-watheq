import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// إعداد الاتصال بقاعدة البيانات والذكاء الاصطناعي
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  // التحقق من أن الطلب قادم من تويلي
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { Body, From } = req.body;
  const userMessage = Body ? Body.trim() : "";
  
  // رابط وكيل الآيفون الذكي الذي استخرجناه من كود التضمين الخاص بك
  const jotFormAgentUrl = "https://www.jotform.com/agent/019adba7f8de7fcebb940f9dec95aeebdf18"; 

  // القائمة الترحيبية الاحترافية لمتجر الآيفون
  const iphoneMenu = `
أهلاً بك في متجر الواثق للأجهزة الذكية 📱🍎
نحن هنا لخدمتك، يرجى اختيار رقم الخدمة:

1️⃣ طلب شراء آيفون جديد/مستعمل (عبر المساعد الذكي)
2️⃣ قائمة أسعار الآيفون المحدثة اليوم
3️⃣ تفاصيل الضمان وسياسة الاستبدال
4️⃣ التحدث مع خبير تقني (AI) لأسئلة المواصفات

يرجى إرسال رقم الخيار (1، 2، 3، أو 4)
  `;

  try {
    let reply = "";

    // منطق الرد بناءً على خيار العميل
    if (userMessage === "1") {
      reply = `تفضل بمتابعة طلبك مع مساعدنا المتخصص في الآيفون عبر الرابط التالي: \n\n ${jotFormAgentUrl} \n\n سيساعدك في اختيار الموديل واللون المناسب!`;
    } else if (userMessage === "2") {
      reply = "💰 أسعارنا اليوم:\n- آيفون 16 برو ماكس: 5200 ريال\n- آيفون 15 برو: 3800 ريال\n- آيفون 14: 2600 ريال\n(الأسعار تشمل الضريبة)";
    } else if (userMessage === "3") {
      reply = "🛡️ الضمان:\n- سنتين للأجهزة الجديدة (وكيل أبل).\n- سنة كاملة للأجهزة المستعملة ضد العيوب التقنية.";
    } else if (userMessage === "4" || userMessage.length > 5) {
      // محاولة استخدام OpenAI للرد على الأسئلة المعقدة
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "أنت خبير مبيعات هواتف آيفون في متجر الواثق. وظيفتك الإجابة عن الفروقات التقنية والمواصفات بذكاء واحترافية." },
            { role: "user", content: userMessage }
          ]
        });
        reply = completion.choices[0].message.content;
      } catch (aiError) {
        // في حال فشل OpenAI (خطأ 429)، نوجه العميل للوكيل الذكي مباشرة
        reply = `عذراً، لدينا ضغط حالياً. يمكنك سؤال خبيرنا الذكي مباشرة من هنا: \n\n ${jotFormAgentUrl}`;
      }
    } else {
      reply = iphoneMenu;
    }

    // سجل العملية في Supabase لتحديث لوحة التحكم التفاعلية
    await supabase.from('tickets').insert([
      { 
        customer_name: From, 
        last_message: userMessage, 
        status: 'تم الرد', 
        ai_tag: 'آيفون' 
      }
    ]);

    // إرسال الرد النهائي لتويلي
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<Response><Message>${reply}</Message></Response>`);

  } catch (error) {
    console.error("Critical Error:", error.message);
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<Response><Message>${iphoneMenu}</Message></Response>`);
  }
}
