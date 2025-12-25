import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default async function handler(req, res) {
  // هذا الجزء هو الذي سيصلح مشكلة "الرابط المعطل" في Jotform
  if (req.method === 'GET') {
    return res.status(200).send("الواثق API يعمل بنجاح!");
  }

  if (req.method === 'POST') {
    const { Body, From } = req.body;
    try {
      await supabase.from('tickets').insert([
        { customer_name: From, last_message: Body, status: 'نشط', ai_tag: 'آيفون' }
      ]);
      return res.status(200).send('Data Logged');
    } catch (e) {
      return res.status(500).send(e.message);
    }
  }
}
