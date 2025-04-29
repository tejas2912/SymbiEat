"use client"

import { useEffect, useState } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type ToastState = {
  open: boolean
  props: ToastProps
}

let listeners: ((state: ToastState) => void)[] = []

let toastState: ToastState = {
  open: false,
  props: {},
}

function emitChange() {
  for (const listener of listeners) {
    listener(toastState)
  }
}

export function toast(props: ToastProps) {
  toastState = { ...toastState, open: true, props }
  emitChange()

  // Auto-dismiss after duration
  setTimeout(() => {
    toastState = { ...toastState, open: false }
    emitChange()
  }, props.duration || 3000)
}

export function useToast() {
  const [state, setState] = useState<ToastState>(toastState)

  useEffect(() => {
    function handleChange(newState: ToastState) {
      setState(newState)
    }

    listeners.push(handleChange)
    return () => {
      listeners = listeners.filter((l) => l !== handleChange)
    }
  }, [])

  return {
    toast,
    ...state,
    dismiss: () => {
      toastState = { ...toastState, open: false }
      emitChange()
    },
  }
}
