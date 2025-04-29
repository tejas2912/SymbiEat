import mongoose from "mongoose"

// Use environment variable with fallback for local development
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/Simbi-Eat-V2"

// Log the connection string (without sensitive info in production)
console.log(`MongoDB URI: ${MONGODB_URI.includes("localhost") ? MONGODB_URI : "Using remote MongoDB connection"}`)

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    console.log("Using cached MongoDB connection")
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    console.log("Establishing new MongoDB connection")
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB connected successfully")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

export default connectDB
