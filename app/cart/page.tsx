"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronRight } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/components/cart/cart-provider"
import { Chatbot } from "@/components/chatbot/chatbot"
import { motion, AnimatePresence } from "framer-motion"
import { Separator } from "@/components/ui/separator"

export default function CartPage() {
  const router = useRouter()
  const {
    items,
    removeItem,
    updateQuantity,
    updateSpecialInstructions,
    totalPrice,
    couponCode,
    setCouponCode,
    discount,
    setDiscount,
    discountedTotal,
  } = useCart()

  const [couponInput, setCouponInput] = useState("")
  const [couponMessage, setCouponMessage] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return

    setIsApplyingCoupon(true)
    setCouponMessage("")

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponInput,
          orderTotal: totalPrice,
        }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setCouponCode(couponInput)
        setDiscount(data.discount)
        setCouponMessage(data.message)
      } else {
        setCouponMessage(data.message || "Invalid coupon code")
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
      setCouponMessage("Failed to apply coupon. Please try again.")
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleProceedToCheckout = () => {
    router.push("/checkout")
  }

  if (!mounted) {
    return null
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="mb-6 text-primary">
              <ShoppingBag className="h-24 w-24 mx-auto opacity-20" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">Add some delicious items to your cart!</p>
            <Link href="/">
              <Button size="lg" className="gap-2">
                Browse Menu <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </main>
        <Chatbot />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <span className="ml-2 bg-primary text-primary-foreground text-sm rounded-full px-2 py-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4"
                >
                  <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.image || "/placeholder.svg?height=100&width=100"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">₹{item.price.toFixed(2)} each</p>

                      <div className="flex items-center mt-3 space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <span className="w-8 text-center">{item.quantity}</span>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {item.specialInstructions && (
                        <div className="mt-2 text-sm bg-muted p-2 rounded-md">
                          <span className="font-medium">Note:</span> {item.specialInstructions}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4 sticky top-20">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>₹{discountedTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="whitespace-nowrap"
                  >
                    {isApplyingCoupon ? "Applying..." : "Apply"}
                  </Button>
                </div>

                {couponMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm ${discount > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {couponMessage}
                  </motion.p>
                )}
              </div>

              <Button className="w-full" size="lg" onClick={handleProceedToCheckout}>
                <span className="flex items-center gap-2">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Chatbot />
    </div>
  )
}
