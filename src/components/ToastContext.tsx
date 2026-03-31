import { createContext, useContext, useState } from "react"

type ToastType = "success" | "error"

type Toast = {
    id: number
    type: ToastType
    message: string
}

type ToastContextType = {
    showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = (type: ToastType, message: string) => {
        const id = Date.now()

        setToasts((prev) => [...prev, { id, type, message }])

        // 🔥 auto remove
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3000)
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast ${t.type}`}>
                        <span className="toast-icon">
                            {t.type === "success" ? "✅" : "❌"}
                        </span>
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error("useToast must be used inside ToastProvider")
    return ctx
}