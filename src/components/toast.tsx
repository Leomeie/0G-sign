"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
  removing?: boolean;
}

interface ToastContextValue {
  show: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        // Trigger exit animation
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, removing: true } : t)),
        );
        // Remove from DOM after animation completes
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 250);
      }, 3500);
    },
    [],
  );

  const colors: Record<string, string> = {
    success: "border-green-500/20 bg-green-500/10 text-green-400",
    error: "border-red-500/20 bg-red-500/10 text-red-400",
    info: "border-zinc-700 bg-zinc-800 text-zinc-300",
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div aria-live="polite" role="status" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg ${t.removing ? "animate-slide-out-right" : "animate-slide-in-right"} ${colors[t.type]}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
