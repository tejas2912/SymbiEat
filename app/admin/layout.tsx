"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (status === "authenticated" && session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="mb-8">You do not have permission to access this page.</p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="admin-theme min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
