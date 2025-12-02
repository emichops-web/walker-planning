import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a UK planning expert."
        },
        {
          role: "user",
          content: "Provide a test planning feasibility response."
        }
      ]
    });

    return res.status(200).json({ result: completion.choices[0].message.content });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}