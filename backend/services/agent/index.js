/* Must be the first import: config modules (redis, s3, tavily) read
   process.env at module scope, which runs before any dotenv.config() call
   placed further down this file. */
import "dotenv/config"
import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import router from "./routes/agent.route.js"

dotenv.config()

const port = process.env.PORT
const app = express()

app.use(express.json())

app.get("/", (req, res) => {
    res.json({ message: "hello from agent" })
})

app.use("/", router)

/* Error handler must be registered after the routes it covers. */
app.use((err, req, res, next) => {
    console.error("agent error:", err?.stack || err?.message || err)

    if (err?.status) {
        return res.status(err.status).json(
            err.data || { message: err.message }
        )
    }

    /* Multer rejections (bad type, too large) are client errors, not 500s. */
    if (err?.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "File must be 20MB or smaller." })
    }

    if (err?.message === "Only PDF and Images are allowed.") {
        return res.status(415).json({ message: err.message })
    }

    return res.status(500).json({
        message: "The assistant could not complete this request."
    })
})

app.listen(port, () => {
    console.log(`agent started at ${port}`)
})

connectDb()