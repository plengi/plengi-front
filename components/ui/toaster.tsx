"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map(({ id, title, description, action, variant, ...props }) => (
                <Toast key={id} variant={variant} {...props}>
                    <div className="flex items-start gap-3">
                        {variant === "success" && <CheckCircle className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />}
                        {variant === "destructive" && <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />}
                        {variant === "default" && <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />}
                        <div className="grid gap-1">
                            {title && <ToastTitle>{title}</ToastTitle>}
                            {description && <ToastDescription>{description}</ToastDescription>}
                        </div>
                    </div>
                    {action}
                    <ToastClose />
                </Toast>
            ))}
            <ToastViewport />
        </ToastProvider>
    )
}
