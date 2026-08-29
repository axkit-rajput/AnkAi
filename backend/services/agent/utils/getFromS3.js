import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

/* expiresIn is SECONDS (AWS SDK). Agents used to pass 24*60 while telling the
   user "10 minutes", so both the value and the copy were wrong - these two
   constants keep the link and its description in sync. */
export const DOWNLOAD_TTL_SECONDS = 24 * 60 * 60
export const DOWNLOAD_TTL_LABEL = "24 hours"

export const getFromS3=async (filename,expiresIn=DOWNLOAD_TTL_SECONDS)=>{
  return await getSignedUrl(
    s3,
    new GetObjectCommand({
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:filename
    }
    ),
    {expiresIn}
  )
}