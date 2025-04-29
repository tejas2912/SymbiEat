"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PlusCircle, MinusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function FoodItemCard({ item }) {
  const { addToCart, cartItems } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState("")

  const cartItem = cartItems.find((cartItem) => cartItem._id === item._id)
  const isInCart = !!cartItem

  const handleAddToCart = () => {
    addToCart({
      ...item,
      quantity,
      specialInstructions: specialInstructions.trim() || null,
    })
    setQuantity(1)
    setSpecialInstructions("")
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={item.image || "/placeholder.svg?height=200&width=300"}
          alt={item.name}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <span className="text-xl font-bold text-white">Not Available</span>
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-primary">{item.category}</Badge>
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <span className="font-medium text-green-600">₹{item.price.toFixed(2)}</span>
        </div>
        <p className="mb-4 text-sm text-gray-500">{item.description}</p>

        {/* Special Instructions Field */}
        <div className="mb-4">
          <Label htmlFor={`instructions-${item._id}`} className="mb-1 block text-sm font-medium">
            Special Instructions
          </Label>
          <Textarea
            id={`instructions-${item._id}`}
            placeholder="E.g., less spicy, no onions, etc."
            className="h-20 resize-none text-sm"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
          />
        </div>

        {item.available ? (
          <>
            {/* Quantity Selector */}
            <div className="mb-4 flex items-center">
              <Label className="mr-2 text-sm font-medium">Quantity:</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={incrementQuantity}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button className="w-full" onClick={handleAddToCart} disabled={!item.available}>
              {isInCart ? "Update in Cart" : "Add to Cart"}
            </Button>
          </>
        ) : (
          <Button className="w-full" disabled>
            Not Available
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
