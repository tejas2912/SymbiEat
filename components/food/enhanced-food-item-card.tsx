"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/components/cart/cart-provider"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"

interface FoodItemProps {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  available: boolean
}

export function EnhancedFoodItemCard({ _id, name, description, price, category, image, available }: FoodItemProps) {
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const { addItem } = useCart()

  // Don't render if item is not available
  if (!available) {
    return null
  }

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
    setIsExpanded(false)
  }

  const getCategoryClass = () => {
    switch (category) {
      case "veg":
        return "category-badge-veg"
      case "nonveg":
        return "category-badge-nonveg"
      case "beverage":
        return "category-badge-beverage"
      case "dessert":
        return "category-badge-dessert"
      default:
        return "bg-secondary"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="overflow-hidden food-card">
        <div className="relative h-48 overflow-hidden group">
          <Image
            src={image || "/placeholder.svg?height=300&width=300"}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <Badge className={`absolute top-2 right-2 ${getCategoryClass()}`}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>

          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "View Less" : "Quick Add"}
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            </div>
            <div className="font-bold text-lg">₹{price.toFixed(2)}</div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <span className="w-8 text-center">{quantity}</span>

                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQuantity((q) => q + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Special Instructions</label>
                <Textarea
                  placeholder="Any special requests..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="text-sm resize-none"
                  rows={2}
                />
              </div>
            </div>
          </motion.div>

          <Button className="w-full mt-4 gap-2" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
