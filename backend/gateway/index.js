/* Must be the first import: config modules (redis, s3, tavily) read
   process.env at module scope, which runs before any dotenv.config() call
   placed further down this file. */
import "dotenv/config"
import express from "express"
import dotenv from "dotenv"
dotenv.config()
import cors from "cors"
import cookieParser from "cookie-parser"
import { getCurrentUser } from "./controllers/user.controller.js"
import protect from "./middleware/auth.middleware.js"
import { proxyService, proxyWithHeader } from "./utils/proxyWithHeader.js"
import morgan from "morgan"
const port =process.env.PORT
const isProduction = process.env.NODE_ENV === "production"

/* Comma-separated, so one deployment can serve more than one front end. */
const allowedOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((entry) => entry.trim().replace(/\/$/, ""))
    .filter(Boolean)

/* Vite picks the first free port, so the dev origin is 5173 one day and 5174
   the next. Matching the whole family beats hard-coding whichever one it got. */
const isLocalOrigin = (origin) =>
    /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)

const app=express()

/*
 * Credentialed CORS cannot use a wildcard, so the origin is echoed per request.
 * Returning false rather than throwing matters: cors() turns a thrown error into
 * a 500, while false simply omits the header and lets the browser refuse - which
 * is the honest answer for an origin we do not know.
 */
app.use(cors({
    origin: (origin, callback) => {
        /* No Origin header at all: same-origin, curl, or service-to-service. */
        if (!origin) return callback(null, true)

        const normalized = origin.replace(/\/$/, "")

        if (allowedOrigins.includes(normalized)) return callback(null, true)

        /* Local pages are trusted outside production only. In production a page
           on the user's own machine must not be able to spend their credits. */
        if (!isProduction && isLocalOrigin(normalized)) return callback(null, true)

        return callback(null, false)
    },
    credentials:true
}))
app.use(morgan("dev"))
app.use(cookieParser())
app.use("/api/auth",proxyService(process.env.AUTH_SERVICE))
app.use("/api/chat",protect,proxyWithHeader(process.env.CHAT_SERVICE))
app.use("/api/agent",protect,proxyWithHeader(process.env.AGENT_SERVICE))
app.use("/api/billing",protect,proxyWithHeader(process.env.BILLING_SERVICE))
app.get("/api/me",protect,getCurrentUser)

app.get("/",(req,res)=>{
    res.json({message:"hello from gateway"})
})

app.listen(port,()=>{
    console.log(`gateway started at ${port}`)

    /* Say it out loud, so this is visible if it is ever true in a deployment. */
    if (!isProduction) {
        console.log("cors: allowing localhost origins (NODE_ENV is not production)")
    }
})  