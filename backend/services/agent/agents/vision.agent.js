import { getModel } from "../config/llmModels.js"
import axios from "axios"
import { uploadToS3 } from "../utils/uploadToS3.js"
import {
    getFromS3,
    DOWNLOAD_TTL_SECONDS,
    DOWNLOAD_TTL_LABEL
} from "../utils/getFromS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
import { agentFailure, agentSuccess } from "../utils/agentFailure.js"

export const visionAgent=async (state) => {

    try {
        await checkAgentLimit(state.userId,"image")
        await deductCredits(state.userId,"vision")

        const llm=await getModel("image")
    const res=await llm.invoke(`
        You are an elite AI image prompt engineer.

Convert the user request into a highly detailed image generation prompt.

Requirements:

- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- Sharp focus
- 8K quality
- Photorealistic
- Depth of field
- Professional photography
- Stunning visuals

Return only the image prompt.

User Request:
${state.prompt}

        `)

const prompt=res.content.trim()

const imageUrl=`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`

/* Image generation is slow; without a timeout a stalled upstream holds the
   request open until the client gives up. */
const imageRes=await axios.get(imageUrl,{
    responseType:"arraybuffer",
    timeout:120000
})

const buffer=Buffer.from(imageRes.data)
const filename=`image-${Date.now()}.png`

await uploadToS3(filename,buffer,"image/png")
const downloadUrl=await getFromS3(filename,DOWNLOAD_TTL_SECONDS)

return agentSuccess(state,{
    aiResponse:`
![Generated Image](${downloadUrl})

📥 [Download Image](${downloadUrl})

⏳ Link expires in ${DOWNLOAD_TTL_LABEL}.`
})
    } catch (error) {
        return agentFailure(state,error,"Failed to generate the image.")
    }
}