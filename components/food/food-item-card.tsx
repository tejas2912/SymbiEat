"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCart } from "@/components/cart/cart-provider"
import { Badge } from "@/components/ui/badge"

interface FoodItemProps {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image: string
}

export function FoodItemCard({ _id, name, description, price, category, image }: FoodItemProps) {
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState("")
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      _id,
      name,
      price,
      quantity,
      specialInstructions: specialInstructions.trim() || undefined,
      image,
    })

    // Reset after adding to cart
    setQuantity(1)
    setSpecialInstructions("")
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        <Badge className="absolute top-2 right-2">{category}</Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="font-bold">₹{price.toFixed(2)}</div>
        </div>

        <div className="space-y-3 mt-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Minus className="h-4 w-4" />
            </Button>

            <span className="w-8 text-center">{quantity}</span>

            <Button variant="outline" size="icon" onClick={() => setQuantity((q) => q + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Input
            placeholder="Special instructions..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="text-sm"
          />

          <Button className="w-full" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
