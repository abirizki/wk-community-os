import OpenAI from "openai";
import 'dotenv/config';

// Inisialisasi client dengan mengarahkan base_url ke endpoint Geraikita AI
const openai = new OpenAI({
  baseURL: "https://geraikita.com",
  apiKey: process.env.GERAIKITA_API_KEY,
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o", // Sesuaikan nama model yang diaktifkan di akun Anda
    messages: [
      { role: "user", content: "Bagaimana cara mengecek data penerima Bansos?" }
    ],
  });

  console.log(completion.choices[0].message.content);
}

main();
