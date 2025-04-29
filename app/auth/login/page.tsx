"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail, Lock } from "lucide-react"
import { motion } from "framer-motion"

const foodEmojis = ["🍕", "🍔", "🍟", "🌮", "🍣", "🍜", "🍩", "🍦", "🥗", "🍱"]

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fix for hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log(`Attempting to sign in with email: ${email}`)
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      console.log("Sign in result:", result)

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error)
        setIsLoading(false)
      } else if (result?.ok) {
        // Fetch user data to determine role
        const userResponse = await fetch("/api/user/me")
        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.role === "admin") {
            router.push("/admin")
          } else {
            router.push(callbackUrl)
          }
        } else {
          // Fallback if user data fetch fails
          router.push(callbackUrl)
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side with animated food emojis - only render when mounted */}
      <div className="hidden md:flex md:w-1/2 auth-gradient items-center justify-center p-8">
        {mounted && (
          <div className="food-emoji-container">
            {foodEmojis.map((emoji, index) => (
              <motion.div
                key={index}
                className={`food-emoji animate-float delay-${index % 4}`}
                initial={{
                  x: Math.random() * 300 - 150,
                  y: Math.random() * 300 - 150,
                  rotate: Math.random() * 20 - 10,
                }}
                animate={{
                  x: [null, Math.random() * 300 - 150],
                  y: [null, Math.random() * 300 - 150],
                  rotate: [null, Math.random() * 20 - 10],
                }}
                transition={{
                  duration: 10,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                {emoji}
              </motion.div>
            ))}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-4">SimbiEat</h1>
                <p className="text-xl">Delicious food at your fingertips</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Right side with login form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Login to SimbiEat</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register" className="font-medium text-primary hover:underline">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
