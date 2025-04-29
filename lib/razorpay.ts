interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  handler: (response: any) => void
  modal?: {
    ondismiss?: () => void
    escape?: boolean
    backdropclose?: boolean
    animation?: boolean
  }
  theme?: {
    color?: string
    backdrop_color?: string
    hide_topbar?: boolean
  }
}

declare global {
  interface Window {
    Razorpay: any
  }
}

// Function to load Razorpay script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// Function to open Razorpay checkout
export const openRazorpayCheckout = async (options: RazorpayOptions): Promise<void> => {
  const scriptLoaded = await loadRazorpayScript()

  if (!scriptLoaded) {
    throw new Error("Failed to load Razorpay checkout script")
  }

  const razorpay = new window.Razorpay(options)
  razorpay.open()
}
