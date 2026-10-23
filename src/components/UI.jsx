import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";
import { Code, Cpu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { notify } from "./Toast";
import { useScrollLock } from "./SmoothScroll";

/* ---------- motion presets ---------- */
export const ease = [0.22, 1, 0.36, 1];

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const rise = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export const listItem = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
};

// cards/rows in filterable lists: arrive staggered, slide when siblings change
export const itemMotion = (i = 0) => ({
  layout: true,
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease, delay: 0.15 + Math.min(i, 10) * 0.05 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
});

/* ---------- class presets ---------- */
export const card = "rounded-3xl bg-card border border-black/[0.04] p-5 sm:p-6";
export const btnPrimary =
  "inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-800 px-5 py-3 font-medium text-white transition-colors hover:bg-brand-700";
export const btnOutline =
  "inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-brand-900 px-5 py-2.5 font-medium transition-colors hover:bg-brand-900 hover:text-white";
export const btnGhost =
  "inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 font-medium transition-colors hover:bg-panel";
export const iconBtn =
  "grid h-10 w-10 place-items-center rounded-full text-muted sm:h-9 sm:w-9 transition-colors hover:bg-panel hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted";
export const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-muted focus:border-brand-500";

/* ---------- helpers ---------- */
export const matches = (q, ...fields) =>
  !q.trim() || fields.some((f) => String(f ?? "").toLowerCase().includes(q.trim().toLowerCase()));

export const fmtDate = (iso, opts = { month: "short", day: "numeric", year: "numeric" }) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

export function useModal() {
  const [s, set] = useState({ open: false, item: null });
  const show = useCallback((item = null) => set({ open: true, item }), []);
  const hide = useCallback(() => set((p) => ({ ...p, open: false })), []);
  return { ...s, show, hide };
}

// lets quick actions (dashboard buttons, help guides) open a page's "create" modal.
// go("users", true) sends { create: true } in the router state; we read it once and clear it,
// so a refresh does not reopen the modal.
export function useAutoCreate(open) {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (state?.create) {
      open();
      navigate(pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}

// go("groups")  |  go("groups", true) opens the create form  |  go("group-management", false, group.id)
export function useGo() {
  const navigate = useNavigate();
  return useCallback(
    (id, create = false, groupId = null) =>
      navigate(id === "group-management" ? `/groups/${groupId}` : `/${id}`, { state: create ? { create: true } : null }),
    [navigate]
  );
}

/* ---------- local data ----------
   Every page owns its own list. Start from the seed in data.js; with an API,
   load the list in a useEffect and call setItems(...) with the result. */
export const uid = () => Math.random().toString(36).slice(2, 9);

export function useCollection(seed, noun, created = "added") {
  const [items, setItems] = useState(seed);
  const api = useMemo(
    () => ({
      setItems,
      add: (item) => {
        setItems((l) => [{ id: uid(), ...item }, ...l]);
        notify(`${noun} ${created}`);
      },
      update: (id, patch) => {
        setItems((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
        notify(`${noun} updated`);
      },
      remove: (id) => {
        setItems((l) => l.filter((x) => x.id !== id));
        notify(`${noun} deleted`);
      },
    }),
    [noun, created]
  );
  return [items, api];
}

export function CountUp({ to }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const c = animate(0, to, { duration: 1.2, delay: 0.4, ease, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [to]);
  return <>{n}</>;
}

/* ---------- avatars & badges ---------- */
const palette = [
  "bg-sky-200 text-sky-900",
  "bg-amber-200 text-amber-900",
  "bg-rose-200 text-rose-900",
  "bg-violet-200 text-violet-900",
  "bg-emerald-200 text-emerald-900",
  "bg-orange-200 text-orange-900",
  "bg-indigo-200 text-indigo-900",
];
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
export const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function Avatar({ name, src, className = "h-10 w-10 text-sm" }) {
  if (src) return <img src={src} alt={name} className={`shrink-0 rounded-full object-cover ${className}`} />;
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-semibold ${palette[hash(name) % palette.length]} ${className}`}>
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ people, max = 4 }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((p) => (
        <Avatar key={p.id ?? p.name} name={p.name} src={p.image} className="h-8 w-8 text-xs ring-2 ring-card" />
      ))}
      {extra > 0 && (
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800 ring-2 ring-card">
          +{extra}
        </span>
      )}
    </div>
  );
}

const badgeTone = {
  Active: "bg-brand-100 text-brand-800",
  Running: "bg-brand-100 text-brand-800",
  Invited: "bg-amber-100 text-amber-800",
  Pending: "bg-amber-100 text-amber-800",
  "On leave": "bg-amber-100 text-amber-800",
  Suspended: "bg-rose-100 text-rose-700",
  Ended: "bg-slate-200 text-slate-700",
};
export function StatusBadge({ status }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${badgeTone[status] ?? "bg-slate-200 text-slate-700"}`}>
      {status}
    </span>
  );
}

export function ProgressBar({ value }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-brand-100/70">
      <motion.div
        className="h-full rounded-full bg-brand-700"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, ease, delay: 0.3 }}
      />
    </div>
  );
}

/* ---------- layout pieces ---------- */
export function PageHeader({ title, subtitle, children }) {
  return (
    <motion.div variants={rise} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl xl:text-[2.6rem]">{title}</h1>
        <p className="mt-1 text-muted">{subtitle}</p>
      </div>
      {children && <div className="flex flex-wrap gap-3 [&>*]:flex-1 sm:[&>*]:flex-none">{children}</div>}
    </motion.div>
  );
}

export function Tabs({ options, value, onChange }) {
  const id = useId();
  return (
    <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1 [scrollbar-width:none]">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="relative shrink-0 rounded-full px-4 py-2 text-sm font-medium"
          >
            {active && (
              <motion.span
                layoutId={id}
                className="absolute inset-0 rounded-full bg-brand-800"
                transition={{ duration: 0.4, ease }}
              />
            )}
            <span className={`relative transition-colors ${active ? "text-white" : "text-muted"}`}>
              {o.label}
              {o.count !== undefined && <span className="ml-1.5 opacity-70">{o.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Empty({ title, text, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className={`${card} text-center`}
    >
      <p className="text-lg font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-muted">{text}</p>
      {children && <div className="mt-5 flex justify-center">{children}</div>}
    </motion.div>
  );
}

/* ---------- modal + form pieces ---------- */
export function Modal({ open, onClose, title, children }) {
  useScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            data-lenis-prevent
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.4, ease }}
            className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-card p-6 sm:max-w-lg sm:rounded-[2rem]"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-medium">{title}</h2>
              <button onClick={onClose} aria-label="Close" className={iconBtn}>
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export function FormActions({ onCancel, submit }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel} className={btnGhost}>
        Cancel
      </button>
      <button type="submit" className={btnPrimary}>
        {submit}
      </button>
    </div>
  );
}

export function CheckRow({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-panel">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-brand-700"
      />
      {children}
    </label>
  );
}

/* ---------- photo upload ---------- */
export function readImage(file, size = 192) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const c = document.createElement("canvas");
      c.width = c.height = size;
      c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function ImageField({ name, value, onChange }) {
  const ref = useRef(null);
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try { onChange(await readImage(file)); } catch { /* ignore unreadable files */ }
  };
  return (
    <div className="flex items-center gap-4">
      <Avatar name={name || "?"} src={value} className="h-16 w-16 text-lg" />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => ref.current.click()} className={`${btnGhost} !px-4 !py-2 text-sm`}>
          {value ? "Change photo" : "Upload photo"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-ink">
            Remove
          </button>
        )}
        <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />
      </div>
    </div>
  );
}

/* ---------- project category icon ---------- */
export function CategoryIcon({ category }) {
  const iot = category === "IoT";
  const Icon = iot ? Cpu : Code;
  return (
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${iot ? "bg-brand-800 text-white" : "bg-brand-100 text-brand-800"}`}>
      <Icon size={22} />
    </span>
  );
}
