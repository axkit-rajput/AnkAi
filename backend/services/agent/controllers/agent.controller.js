import axios from "axios"
import fs from "fs/promises"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"

/* Agents unlink their own upload once they have read it. Anything left behind
   (unused attachment, agent that threw before reading) is removed here so
   ./temp does not grow without bound. */
const removeTempFile = async (file) => {
    if (!file?.path) return

    try {
        await fs.unlink(file.path)
    } catch (error) {
        if (error?.code !== "ENOENT") {
            console.error("failed to remove temp upload:", error?.message || error)
        }
    }
}

export const agent = async (req, res, next) => {
    const file = req.file

    try {
        const { prompt, conversationId, agent } = req.body
        const userId = req.headers["x-user-id"]

        if (!userId) {
            return res.status(401).json({ message: "unauthorized" })
        }

        if (!conversationId) {
            return res.status(400).json({ message: "conversationId is required" })
        }

        const trimmedPrompt = typeof prompt === "string" ? prompt.trim() : ""

        if (!trimmedPrompt && !file) {
            return res.status(400).json({ message: "prompt is required" })
        }

        const result = await graph.invoke({
            prompt: trimmedPrompt,
            conversationId,
            agent,
            userId,
            file
        })

        const aiResponse = result?.aiResponse

        /* A failed run (no credits, rate limited, agent error) must not be
           written to history - a replay of this conversation would otherwise
           feed the error text back to the model as its own past answer. */
        if (result?.failed || !aiResponse) {
            return res.status(result?.failedStatus || 502).json({
                message:
                    aiResponse || "The assistant could not complete this request."
            })
        }

        /* Persist only after the run succeeds, so a failure does not leave a
           user message with no reply attached to it. */
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId,
            role: "user",
            content: trimmedPrompt
        })

        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId,
            role: "assistant",
            content: aiResponse,
            images: result?.images,
            artifacts: result?.artifacts
        })

        await addMessage(conversationId, "user", trimmedPrompt)
        await addMessage(conversationId, "assistant", aiResponse)

        return res.status(200).json({
            answer: aiResponse,
            images: result?.images,
            artifacts: result?.artifacts
        })
    } catch (error) {
        next(error)
    } finally {
        await removeTempFile(file)
    }
}
