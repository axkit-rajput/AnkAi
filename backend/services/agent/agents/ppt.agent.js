import { getModel } from "../config/llmModels.js"
import { generatePpt } from "../utils/generatePpt.js"
import {
    getFromS3,
    DOWNLOAD_TTL_SECONDS,
    DOWNLOAD_TTL_LABEL
} from "../utils/getFromS3.js"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
import { agentFailure, agentSuccess } from "../utils/agentFailure.js"
import { parseJsonResponse } from "../utils/parseJsonResponse.js"

export const pptAgent=async (state) => {
    try {
        await checkAgentLimit(state.userId,"ppt")
        await deductCredits(state.userId,"ppt")

        const llm=await getModel("ppt")
        const prompt=`You are a professional presentation designer.

Return ONLY valid JSON.

Format:

{
"title":"",
"subtitle":"",
"slides":[
{
"title":"",
"points":[
"",
"",
"",
""
]
}
]
}

Rules:

- Generate exactly 6 content slides.
- Each slide should have 4-6 concise bullet points.
- No markdown.
- No explanation.
- No code block.
- Return ONLY JSON.

Topic:

${state.prompt}`

const res=await llm.invoke(prompt)
const data=parseJsonResponse(res.content)

const ppt=await generatePpt(data)
const buffer=await ppt.write({
    outputType:"nodebuffer"
})

const filename=`ppt-${Date.now()}.pptx`

await uploadToS3(filename,buffer,"application/vnd.openxmlformats-officedocument.presentationml.presentation")
const downloadUrl=await getFromS3(filename,DOWNLOAD_TTL_SECONDS)

return agentSuccess(state,{
    aiResponse:`# ✅ Presentation Generated

**${data.title || "Presentation"}**

📥 [Download PPT](${downloadUrl})

_Link expires in ${DOWNLOAD_TTL_LABEL}._`
})

    } catch (error) {
        return agentFailure(state,error,"Failed to generate the presentation.")
    }
}