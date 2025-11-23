"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ConfirmDialogProps {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

export function useConfirmDialog(props: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await props.onConfirm()
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    props.onCancel?.()
  }

  const Dialog = () =>
    isOpen ? (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md p-6 space-y-4">
          {props.isDangerous && (
            <div className="flex items-start gap-3 bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive font-medium">{props.description}</p>
            </div>
          )}
          {!props.isDangerous && (
            <>
              <h2 className="text-lg font-semibold">{props.title}</h2>
              <p className="text-sm text-muted-foreground">{props.description}</p>
            </>
          )}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              {props.cancelText || "Cancel"}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              variant={props.isDangerous ? "destructive" : "default"}
            >
              {isLoading ? "..." : props.confirmText || "Confirm"}
            </Button>
          </div>
        </div>
      </div>
    ) : null

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    Dialog,
  }
}
