import OpenAI from "openai";

export default async (req, context) => {
    try {
        const body = await req.json();
        
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Build a readable input summary from Tally answers
        const summary = `
Address: ${body["What is the address?"] || ""}
Property type: ${body["Property Type"] || ""}
Extension type: ${body["Extension type"] || ""}
Depth: ${body["Depth (metres)"] || ""}
Height: ${body["Height (metres)"] || ""}
Constraints: ${body["Constraints"] || ""}
        `;

        const prompt = `
You are a UK residential planning expert.
Analyse home extensions using simplified Permitted Development rules.

User Input:
${summary}

Your response must include:
1. Verdict: “Likely Permitted Development” or “Likely Requires Planning Permission”
2. Key reasons
3. Risks or caveats
4. Simple explanation for homeowners
5. CTA: “For a full automated PDF planning report, click here.”

Format in clean Markdown.
        `;

        const completion = await client.responses.create({
            model: "gpt-4.1-mini",
            input: prompt
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                result: completion.output_text
            })
        };

    } catch (error) {
        console.error("Function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
