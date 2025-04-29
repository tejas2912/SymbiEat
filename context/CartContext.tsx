"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define types for better type safety
export interface CartItem {
  _id: string
  name: string
  price: number
  quantity: number
  image?: string
  specialInstructions?: string | null
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  updateCartItemQuantity: (itemId: string, quantity: number) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemsCount: () => number
  isCartOpen: boolean
  toggleCart: () => void
  setIsCartOpen: (isOpen: boolean) => void
}

// Create context with a default value
const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load cart from localStorage on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart")
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart))
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error)
          localStorage.removeItem("cart")
        }
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      if (cartItems.length > 0) {
        localStorage.setItem("cart", JSON.stringify(cartItems))
      } else {
        localStorage.removeItem("cart")
      }
    }
  }, [cartItems, mounted])

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((i) => i._id === item._id)

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        }
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, item]
      }
    })
    setIsCartOpen(true)
  }

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    setCartItems((prevItems) => prevItems.map((item) => (item._id === itemId ? { ...item, quantity } : item)))
  }

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId))
  }

  const clearCart = () => {
    setCartItems([])
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart")
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev)
  }

  // Only provide the context if we're mounted (client-side)
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        isCartOpen,
        toggleCart,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Custom hook with proper error handling
export function useCart() {
  const context = useContext(CartContext)
  if (context === null) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
