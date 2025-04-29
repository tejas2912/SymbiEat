// app/api/upload/route.ts

import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { existsSync } from "fs"
import { uploadToS3 } from "@/lib/s3"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${uuidv4()}-${file.name.replace(/\s/g, "-")}`

    let url

    if (process.env.NODE_ENV === "production") {
      console.log("Production mode — uploading to S3...")
      url = await uploadToS3(buffer, filename, file.type)
      console.log("S3 URL:", url)
    } else {
      console.log("Development mode — saving locally...")
      const uploadsDir = path.join(process.cwd(), "public", "uploads")

      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      await writeFile(path.join(uploadsDir, filename), buffer)
      url = `/uploads/${filename}`
      console.log("Saved locally at:", url)
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
