/*
 * Models are told to return raw JSON but regularly wrap it in a ```json fence
 * or add a sentence before it. A bare JSON.parse on that throws and the whole
 * request is reported as a generic failure, so recover the object first.
 */
export const parseJsonResponse = (content) => {
    const text = Array.isArray(content)
        ? content.map((part) => part?.text ?? "").join("")
        : String(content ?? "")

    const withoutFence = text
        .replace(/^\s*```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim()

    const candidates = [withoutFence]

    /* Fall back to the outermost {...} span when there is extra prose. */
    const first = withoutFence.indexOf("{")
    const last = withoutFence.lastIndexOf("}")
    if (first !== -1 && last > first) {
        candidates.push(withoutFence.slice(first, last + 1))
    }

    for (const candidate of candidates) {
        try {
            const parsed = JSON.parse(candidate)
            if (parsed && typeof parsed === "object") return parsed
        } catch {
            /* try the next candidate */
        }
    }

    const error = new Error("Model did not return valid JSON.")
    error.status = 502
    error.data = {
        message: "The model returned an unexpected format. Please try again."
    }
    throw error
}
