import { checkAgentLimit } from "../config/agentLimit.js"
import { getModel } from "../config/llmModels.js"
import { deductCredits } from "../utils/deductCredits.js"
import { agentFailure, agentSuccess } from "../utils/agentFailure.js"
import { parseJsonResponse } from "../utils/parseJsonResponse.js"

export const codingAgent=async (state) => {
try {
   await checkAgentLimit(state.userId,"coding")
   await deductCredits(state.userId,"coding")

   const intentLlm=await getModel("intent")
   const llm=await getModel("coding")
   const intentRes=await intentLlm.invoke(`
    You are an intent classifier.

Return ONLY one of these values.

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:
${state.prompt}
    `)
    /* The classifier can answer with punctuation or a full sentence, so match
       the label instead of requiring an exact string. */
    const intent=String(intentRes?.content ?? "").toUpperCase()

    if(intent.includes("CODE_GENERATION")){
        const prompt=`
        You are AnkAI Coding Agent.

Generate the requested project.

Default stack:
- HTML
- CSS
- JavaScript

Use React / Next.js / Vue ONLY if explicitly requested.

Rules:

- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.

IMAGES
=========================

Always use real Unsplash images.

Never use placeholders.

Return ONLY valid JSON.

Schema:

{
  "files":[
    {
      "name":"index.html",
      "content":"..."
    },
    {
      "name":"style.css",
      "content":"..."
    },
    {
      "name":"script.js",
      "content":"..."
    }
  ]
}

Rules:

- Output must start with {
- Output must end with }
- No markdown
- No explanation
- No extra text
- No \`\`\`
- Never mention intent

User Request:
${state.prompt}
        ` 
        const res=await llm.invoke(prompt)
        const data=parseJsonResponse(res.content)

        const files=Array.isArray(data.files)
            ? data.files.filter(f=>f?.name && typeof f.content==="string")
            : []

        if(files.length===0){
            const error=new Error("Model returned no usable files.")
            error.status=502
            error.data={message:"No files were generated. Please try again."}
            throw error
        }

        return agentSuccess(state,{
            aiResponse:"Code Generated Successfully.",
            artifacts:[
                {
                    id:Date.now(),
                    type:"Project",
                    files,
                    /* The artifact header shows this, so keep it short enough
                       to read instead of pasting the whole prompt. */
                    title:String(state.prompt||"Project").slice(0,60)
                }
            ]
        })
    }

    const res=await llm.invoke(`
        The user's request is:

${intent}

Return Markdown only.

Never generate project files.

Use headings like:

# Overview

## Explanation

## Problems

## Improvements

## Best Practices

## Optimized Code (if needed)

User Request:

${state.prompt}
        `)

   const data=res.content

   return agentSuccess(state,{
    aiResponse:data,
    artifacts:[]
   })
} catch (error) {
   return agentFailure(state,error,"Failed to generate code.",{artifacts:[]})
}

}