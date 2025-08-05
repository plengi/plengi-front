'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // Asegúrate de tener cn instalado (clsx + tailwind-merge)

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: 'default' | 'danger' | 'success';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="border-green-200 bg-white rounded-lg shadow-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-green-900 text-lg font-semibold">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-green-700">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <AlertDialogFooter className="flex flex-row justify-end space-x-3">

                    <AlertDialogCancel 
                        disabled={loading}
                        className={cn(
                        "mt-0 border-green-300 text-green-700 hover:bg-green-50",
                        "focus-visible:ring-green-400 focus-visible:ring-offset-green-50"
                        )}
                    >
                        {cancelText}
                    </AlertDialogCancel>
            
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        className={cn(
                        "focus-visible:ring-2 focus-visible:ring-offset-2",
                        variant === 'danger' && "bg-red-600 hover:bg-red-700 text-white",
                        variant === 'success' && "bg-green-600 hover:bg-green-700 text-white",
                        variant === 'default' && "bg-gray-800 hover:bg-gray-900 text-white",
                        "transition-colors duration-200"
                        )}
                    >
                        {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Procesando...
                        </>
                        ) : (
                        confirmText
                        )}
                    </AlertDialogAction>

                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}