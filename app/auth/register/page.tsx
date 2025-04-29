"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, User, Mail, Lock } from "lucide-react"
import { motion } from "framer-motion"

const foodEmojis = ["🍕", "🍔", "🍟", "🌮", "🍣", "🍜", "🍩", "🍦", "🥗", "🍱"]

export default function RegisterPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Fix for hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register")
      }

      setIsSuccess(true)

      // Auto login after successful registration
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (signInResult?.ok) {
        // Redirect to home page after successful registration and login
        router.push("/")
      } else if (signInResult?.error) {
        throw new Error(signInResult.error)
      }
    } catch (error) {
      setError(error.message || "An error occurred during registration")
    } finally {
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
                <h1 className="text-4xl font-bold mb-4">Join SimbiEat</h1>
                <p className="text-xl">Create an account to start ordering</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Right side with registration form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>Enter your information to create an account</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isSuccess && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>Registration successful! Redirecting...</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password">Password</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="font-medium text-primary hover:underline">
                    Login
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
