"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
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

interface Coupon {
  _id: string
  code: string
  discountPercentage: number
  maxDiscount?: number
  minOrderValue?: number
  active: boolean
  expiresAt?: string
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    maxDiscount: "",
    minOrderValue: "",
    active: true,
    expiresAt: "",
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  async function fetchCoupons() {
    try {
      const response = await fetch("/api/coupons")
      if (!response.ok) {
        throw new Error("Failed to fetch coupons")
      }
      const data = await response.json()
      setCoupons(data)
    } catch (error) {
      console.error("Error fetching coupons:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const openAddDialog = () => {
    setSelectedCoupon(null)
    setFormData({
      code: "",
      discountPercentage: "",
      maxDiscount: "",
      minOrderValue: "",
      active: true,
      expiresAt: "",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setFormData({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || "",
      minOrderValue: coupon.minOrderValue?.toString() || "",
      active: coupon.active,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "",
    })
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const couponData = {
        code: formData.code,
        discountPercentage: Number.parseFloat(formData.discountPercentage),
        maxDiscount: formData.maxDiscount ? Number.parseFloat(formData.maxDiscount) : undefined,
        minOrderValue: formData.minOrderValue ? Number.parseFloat(formData.minOrderValue) : undefined,
        active: formData.active,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      }

      let response
      if (selectedCoupon) {
        // Update existing coupon
        response = await fetch(`/api/coupons/${selectedCoupon._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(couponData),
        })
      } else {
        // Create new coupon
        response = await fetch("/api/coupons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(couponData),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to save coupon")
      }

      const data = await response.json()

      // Update local state
      if (selectedCoupon) {
        setCoupons((prev) => prev.map((coupon) => (coupon._id === selectedCoupon._id ? { ...data } : coupon)))
      } else {
        setCoupons((prev) => [...prev, data])
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving coupon:", error)
      alert("Failed to save coupon")
    }
  }

  const handleDelete = async () => {
    if (!selectedCoupon) return

    try {
      const response = await fetch(`/api/coupons/${selectedCoupon._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete coupon")
      }

      // Update local state
      setCoupons((prev) => prev.filter((coupon) => coupon._id !== selectedCoupon._id))
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting coupon:", error)
      alert("Failed to delete coupon")
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading coupons...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Coupon Codes</h2>
        <Button onClick={openAddDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Coupon
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Max Discount</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No coupons found
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>{coupon.discountPercentage}%</TableCell>
                  <TableCell>{coupon.maxDiscount ? `₹${coupon.maxDiscount.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>{coupon.minOrderValue ? `₹${coupon.minOrderValue.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never"}</TableCell>
                  <TableCell>
                    <Badge variant={coupon.active ? "default" : "secondary"}>
                      {coupon.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(coupon)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={() => openDeleteDialog(coupon)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Coupon Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCoupon ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., WELCOME20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
              <Input
                id="discountPercentage"
                name="discountPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={handleInputChange}
                placeholder="e.g., 20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDiscount">Maximum Discount (₹) (Optional)</Label>
              <Input
                id="maxDiscount"
                name="maxDiscount"
                type="number"
                min="0"
                value={formData.maxDiscount}
                onChange={handleInputChange}
                placeholder="e.g., 100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderValue">Minimum Order Value (₹) (Optional)</Label>
              <Input
                id="minOrderValue"
                name="minOrderValue"
                type="number"
                min="0"
                value={formData.minOrderValue}
                onChange={handleInputChange}
                placeholder="e.g., 200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
              <Input
                id="expiresAt"
                name="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>{selectedCoupon ? "Update" : "Add"} Coupon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the coupon code "{selectedCoupon?.code}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
