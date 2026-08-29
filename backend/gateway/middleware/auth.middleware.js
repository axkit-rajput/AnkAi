import redis from "../../shared/redis/redis.js"

const protect = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.session

        /* 401, not 400: the client distinguishes "not signed in" (expected on
           first load) from a real request error. */
        if (!sessionId) {
            return res.status(401).json({ message: "unauthorized" })
        }

        const session = await redis.get(`session-${sessionId}`)

        if (!session) {
            return res.status(401).json({ message: "session expired" })
        }

        let parsed
        try {
            parsed = JSON.parse(session)
        } catch {
            await redis.del(`session-${sessionId}`)
            return res.status(401).json({ message: "session expired" })
        }

        if (!parsed?.userId) {
            return res.status(401).json({ message: "session expired" })
        }

        req.user = parsed
        next()
    } catch (error) {
        /* Never log the session body itself - it carries user details. */
        console.error("protect error:", error?.message || error)
        return res.status(500).json({ message: "authentication check failed" })
    }
}

export default protect
