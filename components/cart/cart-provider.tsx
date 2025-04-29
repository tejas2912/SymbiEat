"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface CartItem {
  _id: string
  name: string
  price: number
  quantity: number
  specialInstructions?: string
  image: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateSpecialInstructions: (itemId: string, instructions: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  couponCode: string
  setCouponCode: (code: string) => void
  discount: number
  setDiscount: (amount: number) => void
  discountedTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)

  // Load cart from localStorage on client-side
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }

    const savedCoupon = localStorage.getItem("couponCode")
    if (savedCoupon) {
      setCouponCode(savedCoupon)
    }

    const savedDiscount = localStorage.getItem("discount")
    if (savedDiscount) {
      setDiscount(Number.parseFloat(savedDiscount))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  // Save coupon and discount to localStorage
  useEffect(() => {
    localStorage.setItem("couponCode", couponCode)
    localStorage.setItem("discount", discount.toString())
  }, [couponCode, discount])

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((i) => i._id === item._id)

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
          specialInstructions: item.specialInstructions || updatedItems[existingItemIndex].specialInstructions,
        }
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, item]
      }
    })
  }

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item._id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems((prevItems) => prevItems.map((item) => (item._id === itemId ? { ...item, quantity } : item)))
  }

  const updateSpecialInstructions = (itemId: string, instructions: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item._id === itemId ? { ...item, specialInstructions: instructions } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
    setCouponCode("")
    setDiscount(0)
    localStorage.removeItem("cart")
    localStorage.removeItem("couponCode")
    localStorage.removeItem("discount")
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

  const discountedTotal = Math.max(totalPrice - discount, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateSpecialInstructions,
        clearCart,
        totalItems,
        totalPrice,
        couponCode,
        setCouponCode,
        discount,
        setDiscount,
        discountedTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
