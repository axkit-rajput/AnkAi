import redis from "../../../shared/redis/redis.js"
import { getMessages } from "../utils/getMessages.js"

const MEMORY_TTL_SECONDS = 24 * 60 * 60
const MAX_MEMORY_MESSAGES = 20

const key = (conversationId) => `messages-${conversationId}`

/* Only role/content is ever used for prompting. Storing the whole message doc
   put artifact file contents into Redis and into every later prompt. */
const toMemoryEntry = (message) => ({
    role: message?.role,
    content: typeof message?.content === "string" ? message.content : ""
})

export const getMemory = async (conversationId) => {
    if (!conversationId) return []

    const cacheKey = key(conversationId)

    try {
        const cached = await redis.get(cacheKey)
        if (cached) {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed)) return parsed
        }
    } catch (error) {
        /* A corrupt cache entry must not break the conversation. */
        console.error("memory read failed:", error?.message || error)
    }

    const messages = await getMessages(conversationId)

    const memory = (Array.isArray(messages) ? messages : [])
        .map(toMemoryEntry)
        .filter((entry) => entry.role && entry.content)
        .slice(-MAX_MEMORY_MESSAGES)

    try {
        await redis.set(
            cacheKey,
            JSON.stringify(memory),
            "EX",
            MEMORY_TTL_SECONDS
        )
    } catch (error) {
        console.error("memory write failed:", error?.message || error)
    }

    return memory
}

export const addMessage = async (conversationId, role, content) => {
    if (!conversationId || !role || !content) return

    const cacheKey = key(conversationId)

    try {
        const rawMessages = await redis.get(cacheKey)
        const messages = rawMessages ? JSON.parse(rawMessages) : []
        const list = Array.isArray(messages) ? messages : []

        list.push({ role, content })

        /* slice, not a single shift - one shift per write left the window
           growing whenever more than one message arrived between reads. And the
           TTL has to be re-sent, otherwise this key becomes permanent. */
        await redis.set(
            cacheKey,
            JSON.stringify(list.slice(-MAX_MEMORY_MESSAGES)),
            "EX",
            MEMORY_TTL_SECONDS
        )
    } catch (error) {
        console.error("memory append failed:", error?.message || error)
    }
}
