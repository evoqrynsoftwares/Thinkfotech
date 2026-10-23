import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BookOpen, ChevronDown, LayoutGrid, Search, Users, UsersRound, X } from "lucide-react";
import { PageHeader, Tabs, card, ease, matches, rise, stagger, useGo } from "./UI";

/* ---------- content ----------
   Edit the text here, or load `guides` from your API.
   steps: numbered instructions   note: an extra tip   to / create: where the button goes */
const topics = {
  Dashboard: { label: "Dashboard", icon: LayoutGrid },
  Users: { label: "Users", icon: Users },
  Groups: { label: "Groups", icon: UsersRound },
  Materials: { label: "Study materials", icon: BookOpen },
};

const guides = [
  {
    id: "g1", topic: "Users", title: "Add a user",
    summary: "Create a new person and save their details.",
    steps: ["Open Users and press Add user.", "Fill in the name, email, phone and address. A photo is optional.", "Press Add user to save."],
    to: "users", create: true, cta: "Add a user now",
  },
  {
    id: "g2", topic: "Users", title: "Find a user",
    summary: "Search by name, email, phone or address.",
    steps: ["Open Users.", "Type in the search box above the list. Results update as you type.", "Use the page buttons under the list to see more people."],
    to: "users", cta: "Open Users",
  },
  {
    id: "g3", topic: "Users", title: "Why can't I delete my own account?",
    summary: "The delete button is switched off for you.",
    note: "This keeps you from locking yourself out. Ask another admin if your account needs to be removed.",
  },
  {
    id: "g4", topic: "Groups", title: "Create a group",
    summary: "Make a team and choose who is in it.",
    steps: ["Open Groups and press Create group.", "Enter a name and a short description.", "Tick the people you want. Use the search box for long lists, or Select all.", "Press Create group."],
    to: "groups", create: true, cta: "Create a group now",
  },
  {
    id: "g5", topic: "Groups", title: "Add or remove members",
    summary: "Change who belongs to a group.",
    steps: ["Open Groups and press Manage on the group.", "To remove someone, press Remove next to their name under Members.", "To add people, press Edit group at the bottom, tick them and save."],
    to: "groups", cta: "Open Groups",
  },
  {
    id: "g6", topic: "Groups", title: "Share a join code",
    summary: "Give people a code they can use to join.",
    steps: ["Press Manage on the group and find Join code.", "Type a code, or press Generate for a random one.", "Press Save code. Use the copy icon to share it.", "To change it later, press the pencil icon."],
    to: "groups", cta: "Open Groups",
  },
  {
    id: "g7", topic: "Groups", title: "Delete a group",
    summary: "Remove a group you no longer need.",
    steps: ["Press Manage on the group and scroll to Group settings.", "Press Delete group.", "Confirm with Yes, delete."],
    note: "People and study materials are kept. They just stop belonging to that group.",
    to: "groups", cta: "Open Groups",
  },
  {
    id: "g8", topic: "Materials", title: "Add study materials to a group",
    summary: "Choose which materials a group can use.",
    steps: ["Press Manage on the group and scroll to Study materials.", "The first ten materials are shown. Search to find any other.", "Press Add. Press Added again to take it back out."],
    note: "A material that is not in any group is shared with everyone. Adding one that belongs to another group moves it.",
    to: "groups", cta: "Open Groups",
  },
  {
    id: "g9", topic: "Dashboard", title: "See who joined recently",
    summary: "Track new registrations.",
    note: "The chart shows new users for the last eight weeks. Under it, Recently registered lists the five newest people with their join dates.",
    to: "dashboard", cta: "Open Dashboard",
  },
  {
    id: "g10", topic: "Dashboard", title: "Understand the dashboard numbers",
    summary: "What each card is counting.",
    note: "Total Projects splits into running and pending. Active Users counts people whose status is Active. Groups and Study Materials show how many exist, with a note on what is not assigned yet.",
    to: "dashboard", cta: "Open Dashboard",
  },
];

export default function Help() {
  const go = useGo();
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [openId, setOpenId] = useState(null);

  const inTopic = (g) => topic === "all" || g.topic === topic;
  const shown = guides.filter(
    (g) => inTopic(g) && matches(search, g.title, g.summary, g.note ?? "", (g.steps ?? []).join(" "))
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader title="Help" subtitle="Step-by-step guides for everything in Thinkfotech." />

      <div className="mt-6">
        {/* guides */}
        <motion.section variants={rise} className={`${card} !p-3 sm:!p-5`}>
          <label className="flex h-12 items-center gap-3 rounded-full bg-panel px-4">
            <Search size={19} strokeWidth={1.6} className="shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpenId(null); }}
              placeholder="Search guides, for example join code"
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search" className="text-muted hover:text-ink">
                <X size={16} />
              </button>
            )}
          </label>

          <div className="mt-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Tabs
              value={topic}
              onChange={(v) => { setTopic(v); setOpenId(null); }}
              options={[
                { value: "all", label: "All", count: guides.length },
                ...Object.entries(topics).map(([id, t]) => ({ value: id, label: t.label, count: guides.filter((g) => g.topic === id).length })),
              ]}
            />
          </div>

          <ul className="mt-3 divide-y divide-black/[0.06]">
            <AnimatePresence>
              {shown.map((g, i) => {
                const Icon = topics[g.topic].icon;
                const open = openId === g.id;
                return (
                  <motion.li
                    key={g.id}
                    layout="position"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease, delay: Math.min(i, 8) * 0.04 } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    className="py-1"
                  >
                    <button
                      onClick={() => setOpenId(open ? null : g.id)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-4 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 sm:px-3"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-[3px] border-brand-600 text-brand-600">
                        <Icon size={18} strokeWidth={2.2} />
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block font-semibold">{g.title}</span>
                        <span className="mt-0.5 block text-sm text-muted">{g.summary}</span>
                      </span>
                      <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease }} className="shrink-0 text-muted">
                        <ChevronDown size={20} />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 px-2 pb-4 pt-2 sm:pl-[4.75rem] sm:pr-3">
                            {g.steps && (
                              <ol className="space-y-3">
                                {g.steps.map((step, n) => (
                                  <li key={n} className="flex items-start gap-3">
                                    <span className="mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-900 text-xs font-semibold text-white">{n + 1}</span>
                                    <span className="text-[15px]">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            )}
                            {g.note && <p className="rounded-2xl bg-panel px-4 py-3 text-sm text-muted">{g.note}</p>}
                            {g.to && (
                              <button
                                onClick={() => go(g.to, Boolean(g.create))}
                                className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                              >
                                {g.cta} <ArrowUpRight size={16} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {shown.length === 0 && (
            <div className="mt-3 rounded-2xl bg-panel px-4 py-10 text-center">
              <p className="font-medium">No guides found</p>
              <p className="mt-1 text-sm text-muted">Try different words.</p>
            </div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
}