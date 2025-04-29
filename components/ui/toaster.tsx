"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { props, open, dismiss } = useToast()

  return (
    <ToastProvider>
      {open && (
        <Toast variant={props.variant} onOpenChange={dismiss}>
          <div className="grid gap-1">
            {props.title && <ToastTitle>{props.title}</ToastTitle>}
            {props.description && <ToastDescription>{props.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  )
}
