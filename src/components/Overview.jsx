import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight, Plus, TrendingDown, TrendingUp, UserPlus, UsersRound } from "lucide-react";
// read-only page: it counts the seed lists in data.js. With an API, load them in useEffect + useState.
import { groups, isoDaysAgo, materials, pageHeader, projects, users } from "../data";
import {
  AvatarStack, CountUp, PageHeader,
  btnOutline, btnPrimary, card, ease, listItem, rise, stagger, useGo,
} from "./UI";

/* ---------- stat cards ---------- */
function StatCard({ label, value, note, featured, onOpen }) {
  return (
    <motion.div
      variants={rise}
      whileHover={{ y: -4 }}
      className={`rounded-3xl p-4 xl:p-5 ${
        featured
          ? "bg-gradient-to-br from-brand-700 to-brand-950 text-white shadow-[0_18px_30px_-14px_rgba(10,39,87,0.55)]"
          : "border border-black/[0.04] bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-medium sm:text-lg">{label}</h3>
        <button
          onClick={onOpen}
          aria-label={`Open ${label}`}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-transform hover:rotate-45 ${
            featured ? "border-transparent bg-white text-brand-900" : "border-ink/70"
          }`}
        >
          <ArrowUpRight size={16} />
        </button>
      </div>
      <p className="mt-1 text-4xl font-medium leading-none sm:text-5xl xl:text-[3.2rem]"><CountUp to={value} /></p>
      <p className={`mt-3 text-sm ${featured ? "text-white/85" : "text-muted"}`}>{note}</p>
    </motion.div>
  );
}

/* ---------- new registered users per week ---------- */
const WEEKS = 8;
const DAY = 86400000;

function weeklyRegistrations(users) {
  const today = Date.parse(`${isoDaysAgo(0)}T00:00:00Z`);
  const counts = Array(WEEKS).fill(0);
  users.forEach((u) => {
    if (!u.registeredAt) return;
    const age = Math.floor((today - Date.parse(`${u.registeredAt}T00:00:00Z`)) / DAY);
    const b = Math.floor(age / 7);
    if (age >= 0 && b < WEEKS) counts[WEEKS - 1 - b] += 1;
  });
  return counts.map((value, i) => {
    const b = WEEKS - 1 - i;
    const start = new Date(today - (7 * b + 6) * DAY);
    return {
      value,
      label: b === 0 ? "Now" : start.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    };
  });
}

function NewUsersChart() {
  const data = weeklyRegistrations(users);
  const yMax = Math.max(4, Math.max(...data.map((d) => d.value)) + 1);
  const pos = data.map((d, i) => ({
    x: ((i + 0.5) / WEEKS) * 100,
    bottom: 6 + (d.value / yMax) * 80,
  }));
  const svgY = (b) => 100 - b;
  const line = pos.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${svgY(p.bottom)}`;
    const q = pos[i - 1];
    const mid = (q.x + p.x) / 2;
    return `${acc} C ${mid} ${svgY(q.bottom)} ${mid} ${svgY(p.bottom)} ${p.x} ${svgY(p.bottom)}`;
  }, "");
  const area = `${line} L ${pos[WEEKS - 1].x} 100 L ${pos[0].x} 100 Z`;

  const total = data.reduce((s, d) => s + d.value, 0);
  const now = data[WEEKS - 1].value;
  const diff = now - data[WEEKS - 2].value;
  const Trend = diff < 0 ? TrendingDown : TrendingUp;

  return (
    <motion.section variants={rise} className={`${card} !p-4 sm:!p-5 xl:col-span-7`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium sm:text-lg">New registered users per week</h3>
          <p className="mt-1 text-sm text-muted">{total} users joined in the last {WEEKS} weeks</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1.5 text-sm font-medium text-brand-800">
          <Trend size={15} />
          {now} this week{diff !== 0 && `, ${diff > 0 ? "+" : ""}${diff} vs last week`}
        </div>
      </div>

      <div className="relative mt-4 h-40 sm:h-48">
        {[0, 1, 2, 3, 4].map((k) => (
          <div key={k} className="absolute inset-x-0 border-t border-dashed border-black/10" style={{ bottom: `${6 + (k / 4) * 80}%` }} />
        ))}

        <motion.div
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1.3, ease, delay: 0.5 }}
          className="absolute inset-0"
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="users-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3478ea" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3478ea" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#users-fill)" />
            <path d={line} fill="none" stroke="#1648ac" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </motion.div>

        {pos.map((p, i) => (
          <div key={i} className="absolute -translate-x-1/2 translate-y-[6px]" style={{ left: `${p.x}%`, bottom: `${p.bottom}%` }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease, delay: 0.6 + i * 0.14 }}
              className="flex flex-col items-center"
            >
              <span className="mb-1.5 rounded-md bg-white px-1.5 py-0.5 text-xs font-semibold shadow-[0_1px_6px_rgba(0,0,0,0.12)]">
                {data[i].value}
              </span>
              <span className={`block h-3 w-3 rounded-full border-2 border-brand-700 ${i === WEEKS - 1 ? "bg-brand-700" : "bg-white"}`} />
            </motion.div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex">
        {data.map((d, i) => (
          <span key={i} className={`flex-1 text-center text-[11px] sm:text-sm ${i === WEEKS - 1 ? "font-semibold text-ink" : "text-muted"}`}>
            {d.label}
          </span>
        ))}
      </div>
    </motion.section>
  );
}

/* ---------- projects by type: IoT vs software, school vs college ---------- */
const R = 38;
const C = 2 * Math.PI * R;

function ProjectMix() {
  const total = projects.length;
  const segs = [
    { label: "IoT", color: "#0f3680", dot: "bg-brand-800", n: projects.filter((p) => p.category === "IoT").length },
    { label: "Software", color: "#5b93f1", dot: "bg-brand-400", n: projects.filter((p) => p.category === "Software").length },
  ];
  let start = 0;

  return (
    <motion.section variants={rise} className={`${card} !p-4 sm:!p-5 xl:col-span-5`}>
      <h3 className="text-base font-medium sm:text-lg">Projects by type</h3>
      <p className="mt-1 text-sm text-muted">IoT and software work across schools and colleges</p>

      <div className="mt-4 items-center gap-6 md:grid md:grid-cols-2 xl:block xl:space-y-4">
        <div className="relative mx-auto aspect-square w-full max-w-[10rem]">
          <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`${segs[0].n} IoT and ${segs[1].n} software projects`}>
            <g transform="rotate(-90 50 50)">
              <circle cx="50" cy="50" r={R} fill="none" stroke="#dde3ef" strokeWidth="14" />
              {segs.map((s) => {
                const len = total ? (s.n / total) * C : 0;
                const gap = total && segs.every((x) => x.n) ? 2 : 0;
                const offset = -start;
                start += len;
                return (
                  <motion.circle
                    key={s.label}
                    cx="50" cy="50" r={R} fill="none" stroke={s.color} strokeWidth="14"
                    strokeDashoffset={offset}
                    initial={{ strokeDasharray: `0 ${C}` }}
                    animate={{ strokeDasharray: `${Math.max(len - gap, 0)} ${C}` }}
                    transition={{ duration: 1.2, ease, delay: 0.6 }}
                  />
                );
              })}
            </g>
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <p className="text-3xl font-medium leading-none"><CountUp to={total} /></p>
            <p className="mt-1 text-sm text-muted">projects</p>
          </div>
        </div>

        <div className="mt-4 space-y-4 md:mt-0 xl:mt-0">
          <ul className="grid grid-cols-2 gap-3">
            {segs.map((s) => (
              <li key={s.label} className="rounded-2xl bg-panel px-3 py-2.5">
                <p className="flex items-center gap-2 text-sm text-muted"><span className={`h-3 w-3 rounded-full ${s.dot}`} />{s.label}</p>
                <p className="mt-1 text-xl font-medium leading-none">
                  {s.n} <span className="text-sm font-normal text-muted">{total ? Math.round((s.n / total) * 100) : 0}%</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}

/* avatar colours for the recent users list */
const avatarColors = [
  "bg-orange-200 text-orange-900",
  "bg-emerald-200 text-emerald-900",
  "bg-sky-200 text-sky-900",
  "bg-rose-200 text-rose-900",
  "bg-violet-200 text-violet-900",
];

export default function Overview() {
  const go = useGo();
  const n = (s) => projects.filter((p) => p.status === s).length;
  const stats = [
    { label: "Total Projects", value: projects.length, note: `${n("Running")} running, ${n("Pending")} pending`, featured: true, to: "projects" },
    { label: "Active Users", value: users.filter((u) => u.status === "Active").length, note: `${users.filter((u) => u.status === "Invited").length} invited`, to: "users" },
    { label: "Groups", value: groups.length, note: `${projects.filter((p) => !p.groupId).length} projects without a group`, to: "groups" },
    { label: "Study Materials", value: materials.length, note: `${materials.filter((m) => !m.groupId).length} shared with everyone`, to: "materials" },
  ];

  /* ---------- recent lists ----------
     Today this reads data.js. For an API, load users and groups
     with fetch + useState/useEffect and keep the two lines below as they are.
     Users need: name, email, status, registeredAt (date)
     Groups need: name, memberIds (list of user ids). Newest group = last one.   */
  const recentUsers = [...users]
    .sort((a, b) => (Date.parse(b.registeredAt) || 0) - (Date.parse(a.registeredAt) || 0))
    .slice(0, 5);
  const recentGroups = [...groups].reverse().slice(0, 5);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader title={pageHeader.title} subtitle={pageHeader.subtitle}>
        <button onClick={() => go("projects", true)} className={`${btnPrimary} !py-2.5`}><Plus size={18} /> Add Project</button>
        <button onClick={() => go("groups", true)} className={`${btnOutline} !py-2`}><UsersRound size={16} /> New Group</button>
      </PageHeader>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} onOpen={() => go(s.to)} />)}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <NewUsersChart />
        <ProjectMix />

        {/* recently registered users */}
        <motion.section variants={rise} className={`${card} !p-4 sm:!p-5 xl:col-span-7`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-medium sm:text-lg">Recently registered</h3>
              <p className="mt-1 text-sm text-muted">The last 5 people who joined</p>
            </div>
            <button onClick={() => go("users")} className="flex items-center gap-1 rounded-full border border-ink/70 py-2 pl-4 pr-3 text-sm font-medium transition-colors hover:bg-ink hover:text-white">
              View all <ChevronRight size={15} />
            </button>
          </div>

          {recentUsers.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-panel px-4 py-6 text-center">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl border-[3px] border-brand-600 text-brand-600"><UserPlus size={20} /></span>
              <p className="mt-3 text-sm text-muted">No users yet. Invite your first teammate.</p>
              <button onClick={() => go("users", true)} className={`${btnPrimary} mt-3`}>Add user</button>
            </div>
          ) : (
            <motion.ul variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.7 } } }} className="mt-3 divide-y divide-black/[0.06]">
              {recentUsers.map((u, i) => (
                <motion.li key={u.id} variants={listItem} className="flex items-center gap-3 py-2.5">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${avatarColors[i % avatarColors.length]}`}>
                    {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="mt-0.5 truncate text-sm text-muted">{u.email}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.status === "Invited" ? "bg-orange-100 text-orange-800" : "bg-brand-100 text-brand-800"}`}>
                      {u.status}
                    </span>
                    <span className="text-xs text-muted">
                      {u.registeredAt ? new Date(`${u.registeredAt}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) : ""}
                    </span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.section>

        {/* newest groups */}
        <motion.section variants={rise} className={`${card} !p-4 sm:!p-5 xl:col-span-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-medium sm:text-lg">Newest groups</h3>
              <p className="mt-1 text-sm text-muted">The last 5 groups created</p>
            </div>
            <button onClick={() => go("groups")} className="flex items-center gap-1 rounded-full border border-ink/70 py-2 pl-4 pr-3 text-sm font-medium transition-colors hover:bg-ink hover:text-white">
              View all <ChevronRight size={15} />
            </button>
          </div>

          {recentGroups.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-panel px-4 py-6 text-center">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl border-[3px] border-brand-600 text-brand-600"><UsersRound size={20} /></span>
              <p className="mt-3 text-sm text-muted">No groups yet. Create one to manage projects as a team.</p>
              <button onClick={() => go("groups", true)} className={`${btnPrimary} mt-3`}>Create group</button>
            </div>
          ) : (
            <motion.ul variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.8 } } }} className="mt-3 divide-y divide-black/[0.06]">
              {recentGroups.map((g) => {
                const people = g.memberIds.map((id) => users.find((u) => u.id === id)).filter(Boolean);
                const projectCount = projects.filter((p) => p.groupId === g.id).length;
                return (
                  <motion.li key={g.id} variants={listItem} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate font-medium">{g.name}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {people.length} {people.length === 1 ? "member" : "members"}, {projectCount} {projectCount === 1 ? "project" : "projects"}
                      </p>
                    </div>
                    <AvatarStack people={people} max={3} />
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
}