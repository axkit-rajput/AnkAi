import fs from "fs"
import path from "path"
import { randomUUID } from "node:crypto"
import multer from "multer"
const uploadDir = path.resolve("./temp")

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir)
    },
    filename(req, file, cb) {
        /* Date.now (no call) stringified the function source into the name, so
           two uploads of the same file name collided and overwrote each other.
           Sanitize too - the original name is attacker controlled. */
        const safeName = path
            .basename(file.originalname || "upload")
            .replace(/[^\w.-]+/g, "_")
            .slice(-100)

        cb(null, `${Date.now()}-${randomUUID()}-${safeName}`)
    },
})

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "application/pdf" ||
        file.mimetype?.startsWith("image/")
    ) {
        cb(null, true)
    } else {
        cb(new Error("Only PDF and Images are allowed."))
    }
}


export default  multer({
    storage, fileFilter, limits: {
        fileSize: 20 * 1024 * 1024
    }
})