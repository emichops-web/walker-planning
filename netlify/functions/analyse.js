import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    // 1️⃣ Parse Tally submission data from the browser
    const body = req.body ? JSON.parse(req.body) : {};
    const fields = body.fields || {};

    const {
      address = "",
      propertyType = "",
      extensionType = "",
      depth = "",
      height = "",
      constraints = ""
    } = fields;

    // 2️⃣ Create GPT client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // 3️⃣ Ask GPT for a proper planning assessment
    const prompt = `
You are a UK residential planning expert.
Analyse whether the following home extension is likely to qualify as Permitted Development.

Address: ${address}
Property type: ${propertyType}
Extension type: ${extensionType}
Depth: ${depth}m
Height: ${height}m
Constraints: ${constraints}

Your response must include:
1. Verdict: “Likely Permitted Development” or “Likely Requires Planning Permission”
2. Key reasoning
3. Risks or caveats
4. Simple explanation for homeowners
5. A short CTA
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a UK planning expert."},
        { role: "user", content: prompt }
      ]
    });

    const result = completion.choices[0].message.content;

    // 4️⃣ Return result to browser
    return res.status(200).json({ result });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
