import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

const EVENT = "thinkfotech:toast";
const ease = [0.22, 1, 0.36, 1];

/* Call notify("User added") from any component. <Toast /> is mounted once in AdminPage. */
export const notify = (message) =>
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message } }));

export default function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer;
    const show = (e) => {
      setToast({ id: Math.random().toString(36).slice(2, 9), message: e.detail.message });
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 2400);
    };
    window.addEventListener(EVENT, show);
    return () => {
      window.removeEventListener(EVENT, show);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[70] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease }}
            className="flex items-center gap-2.5 rounded-full bg-brand-950 px-5 py-3 text-sm font-medium text-white shadow-lg"
          >
            <Check size={16} /> {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
