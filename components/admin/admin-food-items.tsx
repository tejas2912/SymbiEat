"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Pencil, Trash2, X, Search, Upload, ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

interface FoodItem {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  available: boolean
}

export function AdminFoodItems() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "veg",
    image: "",
    available: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showUnavailable, setShowUnavailable] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchFoodItems()
  }, [])

  useEffect(() => {
    // Filter items based on search query, category, and availability
    let filtered = [...foodItems]

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    if (!showUnavailable) {
      filtered = filtered.filter((item) => item.available)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
      )
    }

    setFilteredItems(filtered)
  }, [searchQuery, categoryFilter, showUnavailable, foodItems])

  async function fetchFoodItems() {
    try {
      setIsLoading(true)
      const response = await fetch("/api/food")
      if (!response.ok) {
        throw new Error("Failed to fetch food items")
      }
      const data = await response.json()
      setFoodItems(data)
      setFilteredItems(data)
    } catch (error) {
      console.error("Error fetching food items:", error)
      toast({
        title: "Error",
        description: "Failed to load food items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, available: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file)
    setImageFile(file)
    setImagePreview(previewUrl)

    // Clear the URL input since we're using a file
    setFormData((prev) => ({ ...prev, image: "" }))
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, image: value }))

    // Clear the file input since we're using a URL
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const clearImageSelection = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData((prev) => ({ ...prev, image: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openAddDialog = () => {
    setSelectedItem(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "veg",
      image: "",
      available: true,
    })
    setImageFile(null)
    setImagePreview(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: FoodItem) => {
    setSelectedItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      available: item.available,
    })
    setImageFile(null)
    setImagePreview(null)
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (item: FoodItem) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      let imageUrl = formData.image

      // If we have a file, upload it first
      if (imageFile) {
        const formDataForUpload = new FormData()
        formDataForUpload.append("file", imageFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formDataForUpload,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image")
        }

        const uploadResult = await uploadResponse.json()
        imageUrl = uploadResult.url
      }

      const itemData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        image: imageUrl,
        available: formData.available,
      }

      let response
      if (selectedItem) {
        // Update existing item
        response = await fetch(`/api/food/${selectedItem._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        })
      } else {
        // Create new item
        response = await fetch("/api/food", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save food item")
      }

      const data = await response.json()

      // Update local state
      if (selectedItem) {
        setFoodItems((prev) => prev.map((item) => (item._id === selectedItem._id ? { ...data } : item)))
        toast({
          title: "Success",
          description: "Food item updated successfully",
        })
      } else {
        setFoodItems((prev) => [...prev, data])
        toast({
          title: "Success",
          description: "Food item added successfully",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving food item:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save food item",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/food/${selectedItem._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete food item")
      }

      // Update local state
      setFoodItems((prev) => prev.filter((item) => item._id !== selectedItem._id))
      setIsDeleteDialogOpen(false)
      toast({
        title: "Success",
        description: "Food item deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting food item:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete food item",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryClass = (category: string) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-[hsl(var(--admin-primary))] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text))/0.5]" />
            <Input
              placeholder="Search food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]"
            />
          </div>

          <div className="flex-shrink-0">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="veg">Vegetarian</SelectItem>
                <SelectItem value="nonveg">Non-Vegetarian</SelectItem>
                <SelectItem value="beverage">Beverage</SelectItem>
                <SelectItem value="dessert">Dessert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Switch id="show-unavailable" checked={showUnavailable} onCheckedChange={setShowUnavailable} />
            <Label htmlFor="show-unavailable" className="text-[hsl(var(--admin-text))]">
              Show unavailable items
            </Label>
          </div>

          <Button
            onClick={openAddDialog}
            className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))/0.9] text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-[hsl(var(--admin-card))] rounded-lg border border-[hsl(var(--admin-muted))]">
          <ImageIcon className="h-12 w-12 mx-auto text-[hsl(var(--admin-text))/0.3]" />
          <h3 className="text-xl font-medium mt-4 text-[hsl(var(--admin-text))]">No food items found</h3>
          <p className="text-[hsl(var(--admin-text))/0.7] mt-2">Try changing your search or filter criteria</p>
          <Button
            onClick={openAddDialog}
            className="mt-6 bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))/0.9] text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[hsl(var(--admin-card))] rounded-lg overflow-hidden border border-[hsl(var(--admin-muted))] shadow-sm"
              >
                <div className="relative h-48">
                  <Image
                    src={item.image || "/placeholder.svg?height=300&width=300"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <Badge className={`absolute top-2 right-2 ${getCategoryClass(item.category)}`}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </Badge>
                  {!item.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <Badge variant="destructive" className="text-sm px-3 py-1">
                        Unavailable
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-[hsl(var(--admin-text))]">{item.name}</h3>
                    <div className="font-bold text-[hsl(var(--admin-text))]">₹{item.price.toFixed(2)}</div>
                  </div>
                  <p className="text-sm text-[hsl(var(--admin-text))/0.7] line-clamp-2 mb-4">{item.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]"
                      onClick={() => openEditDialog(item)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[hsl(var(--admin-muted))] text-red-500"
                      onClick={() => openDeleteDialog(item)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add/Edit Food Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit Food Item" : "Add New Food Item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Food item name"
                className="bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Food item description"
                className="bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                className="bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger
                  id="category"
                  className="bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="nonveg">Non-Vegetarian</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Image</Label>

              <div className="grid grid-cols-1 gap-4">
                <div className="border border-dashed border-[hsl(var(--admin-muted))] rounded-lg p-4 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-[hsl(var(--admin-text))/0.5]" />
                    <Label
                      htmlFor="imageFile"
                      className="cursor-pointer text-[hsl(var(--admin-primary))] hover:underline"
                    >
                      Click to upload image
                    </Label>
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <p className="text-xs text-[hsl(var(--admin-text))/0.5]">or enter image URL below</p>
                  </div>
                </div>

                <Input
                  id="imageUrl"
                  name="image"
                  value={formData.image}
                  onChange={handleImageUrlChange}
                  placeholder="Image URL"
                  className="bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]"
                  disabled={!!imageFile}
                />
              </div>

              {/* Image Preview */}
              {(imagePreview || formData.image) && (
                <div className="mt-4 relative">
                  <div className="relative h-40 w-full border border-[hsl(var(--admin-muted))] rounded overflow-hidden">
                    <Image src={imagePreview || formData.image} alt="Preview" fill className="object-contain" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={clearImageSelection}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="available" checked={formData.available} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="available">Available for ordering</Label>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))/0.9] text-white"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  {selectedItem ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{selectedItem ? "Update" : "Add"} Item</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(var(--admin-text))/0.7]">
              This will permanently delete the food item "{selectedItem?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
