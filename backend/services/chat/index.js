/* Must be the first import: config modules (redis, s3, tavily) read
   process.env at module scope, which runs before any dotenv.config() call
   placed further down this file. */
import "dotenv/config"
import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import router from "./routes/chat.routes.js"

dotenv.config()

const port =process.env.PORT

const app=express()
app.use(express.json())
app.use("/",router)
app.get("/",(req,res)=>{
    res.json({message:"hello from chat"})
})

app.listen(port,()=>{
    console.log(`chat started at ${port}`)
    connectDb()
})
