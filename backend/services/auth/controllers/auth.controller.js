import { getAuth } from "firebase-admin/auth"
import { randomUUID } from "node:crypto"
import { app } from "../config/firebase.js"
import User from "../models/user.model.js"
import redis from "../../../shared/redis/redis.js"

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

/*
 * Single source of truth for the session body. /api/me hands this straight to
 * the client, so login must return the exact same shape - otherwise the client
 * sees a different user object before and after a refresh.
 */
const buildSessionPayload = (user) => ({
    userId: String(user._id),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    plan: user.plan,
    credits: user.credits,
    totalCredits: user.totalCredits,
    planExpiresAt: user.planExpiresAt
})

const writeSession = async (sessionId, user) => {
    await redis.set(
        `session-${sessionId}`,
        JSON.stringify(buildSessionPayload(user)),
        "EX",
        SESSION_TTL_SECONDS
    )
}

/*
 * Refresh the cached session after credits or plan change. The lookup can miss
 * (expired session, user never logged in on this deployment) - that must be a
 * no-op, not a write to the literal key "session-null".
 */
const refreshSession = async (user) => {
    const sessionId = await redis.get(`user-session-${user._id}`)
    if (!sessionId) return
    await writeSession(sessionId, user)
}

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "none"
}

export const login = async (req, res) => {
    try {
        const { token } = req.body

        if (!token) {
            return res.status(400).json({ message: "token is required" })
        }

        let decoded
        try {
            decoded = await getAuth(app).verifyIdToken(token)
        } catch {
            return res.status(401).json({ message: "invalid or expired token" })
        }

        let user = await User.findOne({ firebaseUid: decoded.uid })

        if (!user) {
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture
            })
        }

        const sessionId = randomUUID()

        await redis.set(
            `user-session-${user._id}`,
            sessionId,
            "EX",
            SESSION_TTL_SECONDS
        )
        await writeSession(sessionId, user)

        res.cookie("session", sessionId, {
            ...COOKIE_OPTIONS,
            maxAge: SESSION_TTL_SECONDS * 1000
        })

        return res.status(200).json(buildSessionPayload(user))
    } catch (error) {
        console.error("login error:", error)
        return res.status(500).json({ message: "login failed" })
    }
}

export const logOut = async (req, res) => {
    try {
        const sessionId = req.cookies?.session

        if (sessionId) {
            /* Drop the reverse index too, otherwise user-session-<id> lingers
               and later credit updates rewrite a session nobody holds. */
            const session = await redis.get(`session-${sessionId}`)
            if (session) {
                try {
                    const { userId } = JSON.parse(session)
                    if (userId) await redis.del(`user-session-${userId}`)
                } catch {
                    /* Malformed session body - the session key below still goes. */
                }
            }
            await redis.del(`session-${sessionId}`)
        }

        /* clearCookie only matches when the attributes match how it was set. */
        res.clearCookie("session", COOKIE_OPTIONS)
        return res.status(200).json({ message: "logout successfully" })
    } catch (error) {
        console.error("logout error:", error)
        return res.status(500).json({ message: "logout failed" })
    }
}

export const updateUserPayment = async (req, res) => {
    try {
        const { plan, credits, userId } = req.body

        const addedCredits = Number(credits)

        if (!userId || !plan || !Number.isFinite(addedCredits) || addedCredits < 0) {
            return res.status(400).json({ message: "invalid payment payload" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        user.plan = plan
        user.credits += addedCredits
        user.totalCredits += addedCredits
        user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        await user.save()

        await refreshSession(user)

        return res.status(200).json({ success: true })
    } catch (error) {
        console.error("update user payment error:", error)
        return res.status(500).json({ message: "update user payment failed" })
    }
}

const COST = {
    chat: 1,
    search: 5,
    coding: 10,
    pdf: 10,
    ppt: 10,
    vision: 10
}

export const deductCredits = async (req, res) => {
    try {
        const { userId, agent } = req.body

        if (!userId) {
            return res.status(400).json({ message: "userId is required" })
        }

        const requiredCredits = COST[agent] ?? 1

        /* Conditional atomic decrement. A plain read-modify-write lets two
           concurrent requests both pass the balance check and overdraw. */
        const user = await User.findOneAndUpdate(
            { _id: userId, credits: { $gte: requiredCredits } },
            { $inc: { credits: -requiredCredits } },
            { new: true }
        )

        if (!user) {
            const exists = await User.exists({ _id: userId })
            if (!exists) {
                return res.status(404).json({ message: "user not found" })
            }
            return res.status(402).json({ message: "Not enough credits." })
        }

        await refreshSession(user)

        return res.status(200).json({ success: true, credits: user.credits })
    } catch (error) {
        console.error("deduct credits error:", error)
        return res.status(500).json({ message: "deduct credits failed" })
    }
}
