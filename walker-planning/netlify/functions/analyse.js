{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import OpenAI from "openai";\
\
export async function handler(event, context) \{\
  try \{\
    const body = JSON.parse(event.body);\
\
    const \{ address, propertyType, extensionType, depth, height, constraints \} = body;\
\
    const client = new OpenAI(\{\
      apiKey: process.env.OPENAI_API_KEY\
    \});\
\
    const prompt = `\
You are a UK residential planning expert.\
Analyse this home extension for permitted development feasibility.\
\
Address: $\{address\}\
Property type: $\{propertyType\}\
Extension type: $\{extensionType\}\
Depth: $\{depth\}m\
Height: $\{height\}m\
Constraints: $\{constraints\}\
\
Response must include:\
1. Verdict (Likely PD or Requires Planning Permission)\
2. Key reasons\
3. Risks or caveats\
4. Simple explanation for homeowners\
5. CTA short message\
`;\
\
    const completion = await client.chat.completions.create(\{\
      model: "gpt-4o-mini",\
      messages: [\{ role: "user", content: prompt \}]\
    \});\
\
    return \{\
      statusCode: 200,\
      body: JSON.stringify(\{\
        analysis: completion.choices[0].message.content\
      \})\
    \};\
\
  \} catch (error) \{\
    console.error("Error:", error);\
    return \{\
      statusCode: 500,\
      body: JSON.stringify(\{ error: "Failed to analyse" \})\
    \};\
  \}\
\}}