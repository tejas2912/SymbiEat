"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
}

const KEYWORD_RESPONSES: Record<string, string> = {
  coupon: 'You can use coupon code "WELCOME20" to get 20% off on your first order with a minimum order value of ₹200!',
  discount:
    'We offer discounts through coupon codes. Try "WELCOME20" for 20% off or "FLAT50" for a flat ₹50 off on orders above ₹300.',
  delivery: "We deliver to all hostel blocks. Delivery usually takes 15-20 minutes after your order is prepared.",
  payment: "We currently accept cash on delivery only. Online payment options will be available soon!",
  timing: "Our canteen is open from 7 AM to 10 PM every day, including weekends and holidays.",
  menu: "Our menu includes a variety of veg and non-veg items. You can filter them on the homepage by category.",
  order:
    "You can place an order by adding items to your cart and proceeding to checkout. You'll need to be logged in to complete your order.",
  track: "You can track your order status on the 'My Orders' page after placing an order.",
  status:
    "Order statuses include: Pending, Preparing, Ready, Completed, and Cancelled. You can view your order status on the 'My Orders' page.",
  help: "I can help you with information about coupons, discounts, delivery, payment, timing, menu, ordering, and tracking. Just ask me anything!",
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hi there! How can I help you today?", sender: "bot" },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Process response
    setTimeout(() => {
      let botResponse =
        "I'm not sure how to help with that. Try asking about coupons, delivery, payment, timing, menu, ordering, or tracking."

      // Check for keywords in the input (case insensitive)
      const lowercaseInput = input.toLowerCase()

      // Check each keyword
      for (const [keyword, response] of Object.entries(KEYWORD_RESPONSES)) {
        if (lowercaseInput.includes(keyword.toLowerCase())) {
          botResponse = response
          break
        }
      }

      // Special handling for common questions that might not contain exact keywords
      if (
        lowercaseInput.includes("how to") ||
        lowercaseInput.includes("where") ||
        lowercaseInput.includes("what") ||
        lowercaseInput.includes("when")
      ) {
        if (lowercaseInput.includes("order") || lowercaseInput.includes("buy") || lowercaseInput.includes("purchase")) {
          botResponse = KEYWORD_RESPONSES.order
        } else if (
          lowercaseInput.includes("track") ||
          lowercaseInput.includes("status") ||
          lowercaseInput.includes("where is my")
        ) {
          botResponse = KEYWORD_RESPONSES.track
        } else if (
          lowercaseInput.includes("time") ||
          lowercaseInput.includes("hour") ||
          lowercaseInput.includes("open")
        ) {
          botResponse = KEYWORD_RESPONSES.timing
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
      }

      setMessages((prev) => [...prev, botMessage])
    }, 500)
  }

  return (
    <>
      <Button className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>

      <Card
        className={cn(
          "fixed bottom-20 right-4 w-80 shadow-lg transition-all duration-300 transform",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none",
        )}
      >
        <CardHeader className="bg-primary text-primary-foreground py-3 px-4">
          <h3 className="font-semibold">SimbiEat Help</h3>
        </CardHeader>

        <CardContent className="p-3 h-80 overflow-y-auto">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted mr-auto",
                )}
              >
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <CardFooter className="p-3 border-t">
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button size="icon" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
