import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  // 1. استقبال بيانات تويلي (تأتي في req.body)
  const { Body, From } = req.body;

  try {
    // 2. تحليل الرسالة بواسطة الذكاء الاصطناعي
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: Body || "مرحباً" }]
    });
    const aiReply = completion.choices[0].message.content;

    // 3. تخزين الرسالة في جدول tickets في سوبابيس
    const { error } = await supabase.from('tickets').insert([
      { 
        customer_name: From || 'عميل واتساب', 
        last_message: Body, 
        status: 'automated',
        ai_tag: 'استفسار عام'
      }
    ]);

    if (error) throw error;

    // 4. الرد على تويلي بتنسيق TwiML (ضروري ليصل الرد للواتساب)
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(`
      <Response>
        <Message>${aiReply}</Message>
      </Response>
    `);

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
