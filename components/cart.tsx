"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { PlusCircle, MinusCircle, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"

export default function Cart() {
  const { cartItems, removeFromCart, updateCartItemQuantity, getCartTotal, isCartOpen, setIsCartOpen, clearCart } =
    useCart()
  const router = useRouter()
  const { data: session } = useSession()

  const handleCheckout = () => {
    if (!session) {
      router.push("/auth/login?callbackUrl=/checkout")
      setIsCartOpen(false)
      return
    }
    router.push("/checkout")
    setIsCartOpen(false)
  }

  // Close cart when pressing escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartOpen(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [setIsCartOpen])

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="px-1">
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <p className="text-center text-muted-foreground">Your cart is empty</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item._id} className="flex flex-col rounded-lg border p-4 shadow-sm">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>

                      {/* Display special instructions if available */}
                      {item.specialInstructions && (
                        <p className="mt-1 text-xs italic text-gray-500">Note: {item.specialInstructions}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateCartItemQuantity(item._id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateCartItemQuantity(item._id, item.quantity + 1)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <SheetFooter className="flex-col space-y-4 border-t px-1 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-semibold">₹{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex w-full space-x-2">
              <Button variant="outline" className="flex-1" onClick={() => clearCart()}>
                Clear Cart
              </Button>
              <Button className="flex-1" onClick={handleCheckout}>
                Checkout
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
