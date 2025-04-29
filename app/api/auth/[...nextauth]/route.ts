import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import type { AuthOptions } from "next-auth"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        await connectToDatabase()

        const user = await User.findOne({ email: credentials.email })

        if (!user) {
          console.log("User not found")
          throw new Error("User not found")
        }

        console.log("Authentication attempt for:", credentials.email)

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        console.log("Password comparison:", isPasswordValid ? "matched" : "failed")

        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        console.log("Authentication successful")

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
