import { getModel } from "../config/llmModels.js"
import { generatePdf } from "../utils/generatePdf.js"
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

export const pdfAgent=async (state) => {
    try {
        await checkAgentLimit(state.userId,"pdf")
        await deductCredits(state.userId,"pdf")

        const llm=await getModel("pdf")
        const prompt=`
        You are an expert document writer.

Return ONLY valid JSON.

Do NOT return markdown.

Do NOT return explanations.

Structure:

{
"title":"",
"subtitle":"",
"sections":[
{
"heading":"",
"points":[]
}
]
}

Generate 4-8 sections.

Each section should have 3-6 concise bullet points.

Topic:

${state.prompt}
        `

        const res=await llm.invoke(prompt)
        const data=parseJsonResponse(res.content)

        const pdfBuffer=await generatePdf(data)

        const filename=`pdf-${Date.now()}.pdf`
        await uploadToS3(filename,pdfBuffer,"application/pdf")

        const downloadUrl=await getFromS3(filename,DOWNLOAD_TTL_SECONDS)

        return agentSuccess(state,{
          aiResponse:`# PDF Generated

**${data.title || "Document"}**

📥 [Download PDF](${downloadUrl})

_Link expires in ${DOWNLOAD_TTL_LABEL}._`
        })

    } catch (error) {
        return agentFailure(state,error,"Failed to generate the PDF.")
    }
}