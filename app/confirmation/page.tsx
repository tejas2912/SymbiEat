"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Chatbot } from "@/components/chatbot/chatbot"

interface Order {
  _id: string
  orderNumber: string
  status: string
  createdAt: string
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false)
      setError("No order ID provided")
      return
    }

    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch order details")
        }

        const data = await response.json()
        setOrder(data)
      } catch (error) {
        console.error("Error fetching order:", error)
        setError("Failed to load order details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading order details...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        ) : (
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6 text-green-500">
              <CheckCircle className="h-24 w-24 mx-auto" />
            </div>

            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>

            {order && (
              <div className="mb-6">
                <p className="text-muted-foreground mb-2">
                  Your order #{order.orderNumber} has been placed successfully.
                </p>
                <p className="text-muted-foreground">
                  Current status: <span className="font-semibold">{order.status}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <p>Thank you for ordering with SimbiEat!</p>
              <Link href="/">
                <Button>Order More Food</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
      <Chatbot />
    </div>
  )
}
