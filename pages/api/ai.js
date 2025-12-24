import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { Body, From } = req.body;
    
    // حفظ في سوبابيس (بدون انتظار OpenAI حالياً لتجنب خطأ 429)
    const { error: dbError } = await supabase
      .from('tickets')
      .insert([{ customer_name: From, last_message: Body, status: 'automated', ai_tag: 'Test' }]);

    // رد تلقائي بسيط للتأكد من نجاح العملية
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`
      <Response>
        <Message>وصلت رسالتك لنظام الواثق! نحن بصدد معالجتها.</Message>
      </Response>
    `);

  } catch (error) {
    return res.status(500).send(error.message);
  }
}
