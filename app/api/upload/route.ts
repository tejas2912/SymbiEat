import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Create a unique filename
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${uuidv4()}-${file.name.replace(/\s/g, "-")}`

    // Ensure the public/uploads directory exists
    const publicDir = path.join(process.cwd(), "public")
    const uploadsDir = path.join(publicDir, "uploads")

    try {
      // Create directories if they don't exist
      await writeFile(path.join(uploadsDir, filename), buffer)
    } catch (error) {
      console.error("Error writing file:", error)
      // If directory doesn't exist, create it and try again
      const { mkdir } = require("fs/promises")
      await mkdir(uploadsDir, { recursive: true })
      await writeFile(path.join(uploadsDir, filename), buffer)
    }

    // Return the URL to the uploaded file
    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
