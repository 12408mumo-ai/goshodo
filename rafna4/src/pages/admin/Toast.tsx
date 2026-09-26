import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface ToastData {
  type: "success" | "error";
  text: string;
}

export function Toast({ toast }: { toast: ToastData | null }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          role="status"
          className={`fixed bottom-6 right-6 z-[100] flex max-w-sm items-start gap-3 rounded-2xl px-5 py-4 text-cream-50 shadow-lift ${
            toast.type === "success" ? "bg-forest-800" : "bg-clay-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-wa-400"
              aria-hidden
            />
          ) : (
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-cream-50"
              aria-hidden
            />
          )}
          <p className="text-sm leading-relaxed">{toast.text}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
