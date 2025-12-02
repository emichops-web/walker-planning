{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import fetch from "node-fetch";\
\
export const handler = async (event) => \{\
    try \{\
        const body = JSON.parse(event.body);\
\
        const prompt = `\
You are a UK residential planning expert.\
\
Analyse the proposal using simplified Permitted Development rules.\
\
Inputs:\
Address: $\{body["What is the address?"]\}\
Property type: $\{body["Property Type"]\}\
Extension type: $\{body["Extension type"]\}\
Depth: $\{body["Depth (metres)"]\}\
Height: $\{body["Height (metres)"]\}\
Constraints: $\{body["Constraints"]\}\
\
Provide:\
1. Verdict: \'93Likely Permitted Development\'94 or \'93Likely Requires Planning Permission\'94\
2. Key reasons\
3. Risks or caveats\
4. Simple explanation for homeowners\
5. CTA: \'93For a full automated PDF planning report, click here.\'94\
`;\
\
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", \{\
            method: "POST",\
            headers: \{\
                "Content-Type": "application/json",\
                Authorization: `Bearer $\{process.env.OPENAI_API_KEY\}`\
            \},\
            body: JSON.stringify(\{\
                model: "gpt-4.1-mini",\
                messages: [\{ role: "user", content: prompt \}],\
                temperature: 0.3\
            \})\
        \});\
\
        const json = await aiResponse.json();\
        const text = json.choices?.[0]?.message?.content || "No result.";\
\
        return \{\
            statusCode: 200,\
            body: JSON.stringify(\{ analysis: text \})\
        \};\
    \} catch (err) \{\
        return \{\
            statusCode: 500,\
            body: JSON.stringify(\{ error: err.message \})\
        \};\
    \}\
\};}