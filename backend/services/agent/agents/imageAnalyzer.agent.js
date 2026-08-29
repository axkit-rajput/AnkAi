import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import fs from "fs/promises"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
import { agentFailure, agentSuccess } from "../utils/agentFailure.js"

export const imageAnalyzer = async (state) => {
    /* checkAgentLimit used to run outside the try. A 429 escaped as an
       unhandled rejection, so the caller saw a generic 500 and the temp upload
       was never cleaned up. */
    try {
        if (!state.file?.path) {
            const error = new Error("No image was uploaded.")
            error.status = 400
            error.data = { message: "Attach an image to analyze." }
            throw error
        }

        await checkAgentLimit(state.userId, "image")
        await deductCredits(state.userId, "vision")

        const llm = await getModel("imageAnalyzer")

        const imageBuffer = await fs.readFile(state.file.path)
        const base64Image = imageBuffer.toString("base64")

        const messages = [
            new SystemMessage(
                `You are AnkAI image analyzer Agent.

Rules:

- Analyze only the uploaded image.
- Answer the user's question accurately.
- If text exists in the image, extract it.
- If charts or tables exist, explain them.
- If something is unclear, say so.
- Use Markdown when helpful.
- Do not hallucinate.
`
            ),
            new HumanMessage(
                {
                    content: [
                        {
                            type: "text",
                            text: state.prompt || "analyze the image"
                        },
                        {
                            type:"image_url",
                            "image_url":{
                                url:`data:${state.file.mimetype};base64,${base64Image}`
                            }
                        }
                    ]
                }

            )
        ]

const response=await llm.invoke(messages)

return agentSuccess(state,{
    aiResponse:response.content
})

    } catch (error) {
       return agentFailure(state,error,"Failed to analyze the image.")
    }
}