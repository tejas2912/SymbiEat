import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "user" | "admin"
  comparePassword: (password: string) => Promise<boolean>
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
)

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next()

  try {
    // Check if the password is already hashed (starts with $2a$ or $2b$ for bcrypt)
    if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
      console.log("Password already hashed, skipping hashing")
      return next()
    }

    console.log("Hashing password for user:", this.email)
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    console.error("Error hashing password:", error)
    next(error)
  }
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, this.password)
    console.log(`Password comparison for ${this.email}: ${isMatch ? "matched" : "failed"}`)
    return isMatch
  } catch (error) {
    console.error("Password comparison error:", error)
    return false
  }
}

// Check if the model exists before creating a new one
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
