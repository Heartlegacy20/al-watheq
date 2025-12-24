import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // سيتم ربطه في Vercel لاحقاً 
});

export default async function handler(req, res) {
  const { message } = req.body;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {"role": "system", "content": "أنت مساعد ذكي لنظام الواثق، رد بمهنية بناءً على قاعدة المعرفة."},
      {"role": "user", "content": message}
    ],
  });

  res.status(200).json({ reply: completion.choices[0].message.content });
}