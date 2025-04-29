// lib/s3.ts

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

export const uploadToS3 = async (file: Buffer, fileName: string, contentType: string) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME || "",
    Key: fileName,
    Body: file,
    ContentType: contentType,
  }

  try {
    await s3Client.send(new PutObjectCommand(params))
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
  } catch (error) {
    console.error("S3 upload error:", error)
    throw error
  }
}
