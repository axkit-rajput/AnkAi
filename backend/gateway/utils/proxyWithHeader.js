import proxy from "express-http-proxy"

/*
 * A service that is down, restarting or misconfigured surfaces here as a socket
 * error. Left alone, express-http-proxy passes it to Express's default error
 * handler, which replies with an HTML error page - and the frontend, expecting
 * JSON, ended up printing a whole DOCTYPE into the login card. 502 keeps every
 * gateway response the same shape.
 */
const UPSTREAM_DOWN = new Set([
    "ECONNREFUSED",
    "ECONNRESET",
    "ENOTFOUND",
    "ETIMEDOUT",
    "EAI_AGAIN",
])

const proxyErrorHandler = (err, res, next) => {
    if (UPSTREAM_DOWN.has(err?.code)) {
        /* The upstream URL is deliberately not echoed: it is internal topology,
           and it is of no use to whoever is looking at the login screen. */
        console.error("proxy error:", err.code, err.address ? `${err.address}:${err.port}` : "")

        return res.status(502).json({
            message: "Service temporarily unavailable. Please try again in a moment.",
        })
    }

    next(err)
}

/* express-http-proxy buffers the body and defaults to a 1mb cap, so any
   attachment over 1mb was rejected here before it ever reached multer's
   20mb limit. */
const BASE_OPTIONS = { limit: "25mb", proxyErrorHandler }

/* For routes that run before a session exists - auth itself - so there is no
   user to identify, only the error handling and the raised body limit. */
export const proxyService = (serviceUrl) => proxy(serviceUrl, BASE_OPTIONS)

export const proxyWithHeader = (serviceUrl) => {
    return proxy(serviceUrl, {
        ...BASE_OPTIONS,
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            /* Always overwrite: a client-supplied x-user-id must never be able
               to impersonate another account. */
            delete proxyReqOpts.headers["x-user-id"]

            if (srcReq.user?.userId) {
                proxyReqOpts.headers["x-user-id"] = String(srcReq.user.userId)
            }

            return proxyReqOpts
        },
    })
}
