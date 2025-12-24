import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default async function handler(req, res) {
  const { Body, From } = req.body;

  try {
    // حفظ الرسالة في سوبابيس أولاً
    await supabase.from('tickets').insert([
      { customer_name: From, last_message: Body, status: 'انتظار', ai_tag: 'مكملات' }
    ]);

    // رد ثابت سريع يتجاوز مشكلة الرصيد (429)
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`
      <Response>
        <Message>أهلاً بك في الواثق للمكملات! استلمنا رسالتك: "${Body}". سنقوم بالرد عليك بالأسعار حالاً.</Message>
      </Response>
    `);

  } catch (error) {
    res.status(200).send('<Response><Message>جاري معالجة طلبك...</Message></Response>');
  }
}
