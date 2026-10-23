import { useId } from "react";
import { motion } from "framer-motion";
import { Smartphone, Sprout, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { appPromo, brand, generalNav, menuNav } from "../data";
import { ease } from "./UI";

function NavItem({ item, active, pillId, onSelect }) {
  const pill = "absolute inset-0 rounded-xl bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]";
  const Icon = item.icon;
  return (
    <li className="relative">
      {/* glass pill that slides to the active page (the drawer gets a plain pill: it closes on select) */}
      {active && pillId && <motion.span layoutId={pillId} transition={{ duration: 0.45, ease }} className={pill} />}
      {active && !pillId && <span className={pill} />}
      <button
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 ${
          active ? "font-semibold text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon size={20} strokeWidth={1.6} />
        <span className="flex-1">{item.label}</span>
      </button>
    </li>
  );
}

/* The active item comes from the URL, so it is right after a refresh too.
   /groups/g1 (group management) keeps "Groups" highlighted. */
export default function Sidebar({ onSelect, onClose, slide = true }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // the desktop sidebar and the mobile drawer must not share one sliding pill
  const id = useId();
  const pillId = slide ? `nav-active-${id}` : null;

  const isActive = (item) => Boolean(item.to) && (pathname === item.to || pathname.startsWith(`${item.to}/`));
  const open = (item) =>
    item.to
      ? () => {
          navigate(item.to);
          onSelect?.();
        }
      : undefined;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-b from-brand-600 via-brand-800 to-brand-950 p-5 text-white shadow-[0_24px_40px_-20px_rgba(10,39,87,0.65)] xl:p-6">
      {/* soft light behind the content */}
      <span className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-brand-400/30 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] backdrop-blur">
            <Sprout size={22} strokeWidth={2.4} />
          </span>
          <span className="text-2xl font-medium tracking-tight">{brand.name}</span>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      <nav data-lenis-prevent className="relative mt-8 min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="mb-2 px-3 text-xs font-medium tracking-wider text-white/50">MENU</p>
        <ul className="space-y-0.5">
          {menuNav.map((i) => (
            <NavItem key={i.id} item={i} active={isActive(i)} pillId={pillId} onSelect={open(i)} />
          ))}
        </ul>

        <p className="mb-2 mt-7 px-3 text-xs font-medium tracking-wider text-white/50">GENERAL</p>
        <ul className="space-y-0.5">
          {generalNav.map((i) => (
            <NavItem key={i.label} item={i} active={isActive(i)} pillId={pillId} onSelect={open(i)} />
          ))}
        </ul>
      </nav>

      <div className="rings relative mt-4 hidden overflow-hidden rounded-3xl bg-white/10 p-5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] backdrop-blur [@media(min-height:820px)]:block">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-brand-900"><Smartphone size={16} /></span>
        <h3 className="mt-3 text-xl font-medium leading-tight">{appPromo.title}</h3>
        <p className="mt-1.5 text-sm text-white/70">{appPromo.text}</p>
        <button className="mt-4 w-full rounded-full bg-white py-3 text-sm font-semibold text-brand-900 transition-colors hover:bg-white/90">{appPromo.cta}</button>
      </div>
    </div>
  );
}
