"use client"

import { useState, useEffect } from "react"
import { EnhancedFoodItemCard } from "@/components/food/enhanced-food-item-card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Search } from "lucide-react"

interface FoodItem {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  available: boolean
}

export function FoodMenu() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([])
  const [category, setCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFoodItems() {
      try {
        const response = await fetch("/api/food")
        if (!response.ok) {
          throw new Error("Failed to fetch food items")
        }
        const data = await response.json()
        setFoodItems(data)
        setFilteredItems(data.filter((item: FoodItem) => item.available))
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching food items:", error)
        setIsLoading(false)
      }
    }

    fetchFoodItems()
  }, [])

  useEffect(() => {
    // Filter by category and search query
    let filtered = foodItems.filter((item) => item.available) // Only show available items

    if (category !== "all") {
      filtered = filtered.filter((item) => item.category === category)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
      )
    }

    setFilteredItems(filtered)
  }, [category, searchQuery, foodItems])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="w-full max-w-md mx-auto">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden">
              <div className="h-48 bg-gray-200 shimmer"></div>
              <div className="p-4 space-y-2 bg-white">
                <div className="h-6 bg-gray-200 rounded shimmer w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded shimmer"></div>
                <div className="h-4 bg-gray-200 rounded shimmer w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded shimmer mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (foodItems.length === 0) {
    return <div className="text-center py-8">No food items available at the moment.</div>
  }

  // Get unique categories
  const categories = ["all", ...new Set(foodItems.map((item) => item.category))]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Tabs defaultValue="all" value={category} onValueChange={setCategory} className="w-full md:w-auto">
          <TabsList className="w-full md:w-auto grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="veg" className="text-[hsl(var(--veg))]">
              Veg
            </TabsTrigger>
            <TabsTrigger value="nonveg" className="text-[hsl(var(--nonveg))]">
              Non-Veg
            </TabsTrigger>
            <TabsTrigger value="beverage" className="text-[hsl(var(--beverage))]">
              Beverages
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No items found</h3>
          <p className="text-muted-foreground">Try changing your search or filter criteria</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {filteredItems.map((item) => (
            <EnhancedFoodItemCard key={item._id} {...item} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
