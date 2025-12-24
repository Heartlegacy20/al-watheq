import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  const { Body, From } = req.body;
  const userMessage = Body.trim();

  // 1. تعريف القائمة الرئيسية
  const mainMenu = `
أهلاً بك في الواثق للمكملات الغذائية 🏋️‍♂️
يرجى اختيار رقم الخدمة:
1️⃣ قائمة أسعار البروتين
2️⃣ موقع المحل وأوقات الدوام
3️⃣ عروض التوصيل
4️⃣ التحدث مع خبير (ذكاء اصطناعي)
  `;

  try {
    let replyMessage = "";

    // 2. منطق اختيار الأزرار (القائمة)
    if (userMessage === "1") {
      replyMessage = "💰 قائمة الأسعار: واي بروتين (250 ريال)، كرياتين (120 ريال)، BCAA (90 ريال).";
    } else if (userMessage === "2") {
      replyMessage = "📍 موقعنا: الرياض - شارع التخصصي. الدوام من 10ص حتى 10م.";
    } else if (userMessage === "3") {
      replyMessage = "🚚 التوصيل مجاني للطلبات فوق 300 ريال، وخلال 24 ساعة فقط!";
    } else if (userMessage === "4" || userMessage.length > 2) {
      // إذا اختار 4 أو سأل سؤالاً طويلاً، نستخدم الذكاء الاصطناعي
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: "أنت مساعد مبيعات في محل مكملات." }, { role: "user", content: userMessage }]
      });
      replyMessage = completion.choices[0].message.content;
    } else {
      // إذا أرسل أي شيء آخر، نرسل له القائمة الرئيسية
      replyMessage = mainMenu;
    }

    // 3. حفظ المحادثة في سوبابيس
    await supabase.from('tickets').insert([
      { customer_name: From, last_message: userMessage, status: 'تم الرد', ai_tag: 'قائمة الخيارات' }
    ]);

    // 4. إرسال الرد لتويلي
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<Response><Message>${replyMessage}</Message></Response>`);

  } catch (error) {
    res.status(200).send(`<Response><Message>${mainMenu}</Message></Response>`);
  }
}
