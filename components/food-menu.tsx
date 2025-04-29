"use client"

import { useState, useEffect } from "react"
import FoodItemCard from "@/components/food-item-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function FoodMenu() {
  const [foodItems, setFoodItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    async function fetchFoodItems() {
      try {
        const response = await fetch("/api/food-items")
        if (!response.ok) {
          throw new Error("Failed to fetch food items")
        }
        const data = await response.json()
        setFoodItems(data)
        setFilteredItems(data)
      } catch (error) {
        console.error("Error fetching food items:", error)
        setError("Failed to load menu items")
      } finally {
        setLoading(false)
      }
    }

    fetchFoodItems()
  }, [])

  useEffect(() => {
    // Filter items based on search query and category
    let filtered = [...foodItems]

    if (activeCategory !== "all") {
      filtered = filtered.filter((item) => item.category === activeCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
      )
    }

    setFilteredItems(filtered)
  }, [searchQuery, activeCategory, foodItems])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="h-80 rounded-lg bg-gray-100 animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>
  }

  // Get unique categories
  const categories = ["all", ...new Set(foodItems.map((item) => item.category))]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <FoodItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
