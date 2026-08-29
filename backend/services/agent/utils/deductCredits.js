import axios from "axios"

/*
 * Credits must be reserved BEFORE the model call. Deducting afterwards meant an
 * out-of-credits user still received a full (paid-for) answer, because the auth
 * service's refusal was swallowed here.
 *
 * Throws an error carrying { status, data } so the express error handler in
 * index.js surfaces the real reason to the client, the same way
 * checkAgentLimit does for rate limits.
 */
export const deductCredits = async (userId, agent) => {
    try {
        const { data } = await axios.post(
            `${process.env.AUTH_SERVICE}/deduct-credits`,
            { userId, agent }
        )
        return data
    } catch (error) {
        const status = error?.response?.status
        const message = error?.response?.data?.message

        /* 402/400 = the auth service refused (no credits, unknown user). That is
           a real answer, not an outage, so stop the request. */
        if (status && status < 500) {
            const refusal = new Error(message || "Not enough credits.")
            refusal.status = status === 400 ? 402 : status
            refusal.data = {
                success: false,
                agent,
                message: message || "You do not have enough credits for this request."
            }
            throw refusal
        }

        /* The auth service is unreachable. Fail closed rather than serving
           unmetered requests. */
        console.error("deduct credits transport error:", error?.message || error)

        const unavailable = new Error("Credit service unavailable.")
        unavailable.status = 503
        unavailable.data = {
            success: false,
            agent,
            message: "Could not verify your credits right now. Please try again."
        }
        throw unavailable
    }
}
