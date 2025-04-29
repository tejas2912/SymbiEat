"use client"

import type { ReactNode } from "react"
import { Header } from "@/components/layout/header"
import Cart from "@/components/cart/cart"

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Cart />
    </div>
  )
}
