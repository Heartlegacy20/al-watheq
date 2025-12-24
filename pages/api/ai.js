import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  const { Body, From } = req.body;

  // هنا نضع "قاعدة المعرفة" الخاصة بمحلك
  const storeKnowledge = `
    أنت مساعد ذكي لمحل "الواثق للمكملات الغذائية". 
    معلومات المحل:
    - نبيع: بروتين (Whey Protein)، كيرياتين، أحماض أمينية، وفيتامينات.
    - الأسعار: البروتين بـ 250 ريال، الكيرياتين بـ 120 ريال.
    - التوصيل: مجاني للطلبات فوق 300 ريال، وخلال 24 ساعة داخل المدينة.
    - سياسة الرد: كن مهنياً، شجع العميل على الرياضة، وأجب باختصار.
  `;

  try {
    // إرسال الرسالة مع قاعدة المعرفة لـ OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: storeKnowledge },
        { role: "user", content: Body }
      ]
    });

    const aiReply = completion.choices[0].message.content;

    // حفظ العملية في Supabase لمراقبتها من لوحة التحكم
    await supabase.from('tickets').insert([
      { customer_name: From, last_message: Body, status: 'رد آلي', ai_tag: 'استفسار مكملات' }
    ]);

    // إرسال الرد للواتساب
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<Response><Message>${aiReply}</Message></Response>`);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
}
