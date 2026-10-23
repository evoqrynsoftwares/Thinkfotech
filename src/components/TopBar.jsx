import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Menu } from "lucide-react";
import { ease } from "./UI";

/* Top bar: live date and time */
export default function TopBar({ onMenu }) {
  const [now, setNow] = useState(() => new Date());

  // tick every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const date = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const time = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease, delay: 0.1 }}
      className="flex items-center gap-2 rounded-[2rem] bg-panel p-2.5 sm:gap-3 sm:p-3"
    >
      <button onClick={onMenu} aria-label="Open menu" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white lg:hidden">
        <Menu size={20} />
      </button>

      {/* date and time */}
      <div className="flex h-11 items-center gap-4 rounded-full bg-white px-4 text-[15px]">
        <span className="hidden items-center gap-2 sm:flex">
          <CalendarDays size={18} strokeWidth={1.6} className="text-brand-600" />
          <time dateTime={now.toISOString()}>{date}</time>
        </span>
        <span className="hidden h-5 w-px bg-black/10 sm:block" />
        <span className="flex items-center gap-2 font-semibold tabular-nums">
          <Clock size={18} strokeWidth={1.6} className="text-brand-600" />
          {time}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3 pr-1 sm:pr-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-orange-200 text-sm font-semibold text-orange-900 sm:h-12 sm:w-12">
          AD
        </span>
        <div className="hidden leading-tight md:block">
          <p className="font-semibold">Admin Dashboard</p>
        </div>
      </div>
    </motion.header>
  );
}
