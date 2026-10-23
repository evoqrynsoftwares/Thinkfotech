import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Pencil, Phone, Plus, Search, Trash2, X } from "lucide-react";
import { currentUser, isoDaysAgo, users as seedUsers } from "../data";
import { scrollToElement } from "./SmoothScroll";
import {
  Avatar, Empty, Field, FormActions, ImageField, Modal, PageHeader, StatusBadge,
  btnPrimary, card, ease, iconBtn, inputCls, matches, rise, stagger, useAutoCreate, useCollection, useModal,
} from "./UI";

const PAGE_SIZES = [10, 20, 50];

// page buttons with gaps, e.g. [1, "...", 4, 5, 6, "...", 12]
function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("...");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

/* ---------- add / edit form ---------- */
function UserForm({ user, onSave, onCancel }) {
  const [f, setF] = useState({
    image: user?.image ?? "",
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-4">
      <ImageField name={f.name} value={f.image} onChange={(image) => setF((p) => ({ ...p, image }))} />
      <Field label="Full name">
        <input required value={f.name} onChange={set("name")} placeholder="e.g. Maya Thomas" className={inputCls} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email">
          <input required type="email" value={f.email} onChange={set("email")} placeholder="maya@thinkfotech.app" className={inputCls} />
        </Field>
        <Field label="Phone">
          <input required type="tel" value={f.phone} onChange={set("phone")} placeholder="+91 98765 43210" className={inputCls} />
        </Field>
      </div>
      <Field label="Address">
        <textarea required rows={2} value={f.address} onChange={set("address")} placeholder="House or street, city" className={inputCls} />
      </Field>
      <FormActions onCancel={onCancel} submit={user ? "Save changes" : "Add user"} />
    </form>
  );
}

/* One row layout for every screen:
   phone  : a card. user + actions on top, phone and address underneath
   md     : a table row.  # | user | phone | status | actions
   xl     : same, plus an address column */
const cols = "grid-cols-[1fr_auto] md:grid-cols-[3rem_minmax(0,2fr)_minmax(0,1.2fr)_6.5rem_4.5rem] xl:grid-cols-[3rem_minmax(0,2fr)_minmax(0,1.2fr)_6.5rem_minmax(0,2fr)_4.5rem]";
const rowCls = `grid items-center gap-x-3 gap-y-2 rounded-2xl bg-panel p-3 md:gap-x-4 md:bg-transparent md:py-3 md:transition-colors md:hover:bg-panel ${cols}`;

export default function Users() {
  const [users, usersApi] = useCollection(seedUsers, "User");
  const modal = useModal();
  useAutoCreate(() => modal.show());

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  /* ---------- loading ----------
     Shows skeleton rows until the list is ready. Right now it is a short timer.
     With an API, start at true and switch it off when the request finishes:
       useEffect(() => {
         fetch("/api/users").then((r) => r.json()).then(setUsers).finally(() => setLoading(false));
       }, []);                                                                     */
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  /* ---------- search + pagination ----------
     This runs in the browser on the full `users` list.
     For an API, send search, page and pageSize as query params, e.g.
       GET /api/users?search=maya&page=2&limit=10
     then use the returned `items` as `rows` and the returned `total` as `filtered.length`. */
  const filtered = users.filter((u) => matches(search, u.name, u.email, u.phone, u.address));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const first = (currentPage - 1) * pageSize;
  const rows = filtered.slice(first, first + pageSize);

  /* ---------- smooth height ----------
     The list sits in a box whose height is animated, so the card grows and
     shrinks smoothly when rows are added or removed (search, page size, delete). */
  const cardRef = useRef(null);
  const listRef = useRef(null);
  const [listHeight, setListHeight] = useState(null);
  useEffect(() => {
    const watcher = new ResizeObserver(([entry]) => setListHeight(entry.contentRect.height));
    watcher.observe(listRef.current);
    return () => watcher.disconnect();
  }, []);

  /* ---------- actions ---------- */
  const goToPage = (p) => {
    setPage(p);
    scrollToElement(cardRef.current);
  };
  const changeSearch = (value) => { setSearch(value); setPage(1); };
  const save = (f) => {
    if (modal.item) usersApi.update(modal.item.id, f);
    else usersApi.add({ ...f, status: "Active", registeredAt: isoDaysAgo(0) });
    modal.hide();
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader title="Users" subtitle="Control who can sign in and what they can do.">
        <button onClick={() => modal.show()} className={btnPrimary}>
          <Plus size={20} /> Add user
        </button>
      </PageHeader>

      <motion.div ref={cardRef} variants={rise} className={`${card} mt-5 scroll-mt-4 !p-2 sm:mt-6 sm:!p-4`}>
        {/* search */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-3 sm:px-2 sm:pb-4">
          <label className="flex h-11 w-full items-center gap-3 rounded-full bg-panel px-4 sm:max-w-sm">
            <Search size={18} strokeWidth={1.6} className="shrink-0" />
            <input
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              placeholder="Search by name, email or phone"
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
            />
            {search && (
              <button onClick={() => changeSearch("")} aria-label="Clear search" className="text-muted hover:text-ink">
                <X size={16} />
              </button>
            )}
          </label>
          <p className="text-sm text-muted">
            {loading ? "Loading users..." : `${filtered.length} ${filtered.length === 1 ? "user" : "users"}`}
          </p>
        </div>

        {/* table header */}
        <div className={`hidden gap-x-4 px-3 pb-3 text-sm text-muted md:grid ${cols}`}>
          <span>No.</span>
          <span>User</span>
          <span>Phone</span>
          <span>Status</span>
          <span className="hidden xl:block">Address</span>
          <span className="w-[4.5rem]" />
        </div>

        {/* animated-height box around the list */}
        <motion.div
          initial={false}
          animate={{ height: listHeight ?? "auto" }}
          transition={{ duration: 0.45, ease }}
          className="overflow-hidden"
        >
          <div ref={listRef}>
            {loading ? (
              <ul role="status" aria-label="Loading users" className="animate-pulse space-y-2 motion-reduce:animate-none md:space-y-0">
                {Array.from({ length: 6 }, (_, i) => (
                  <li key={i} className={rowCls}>
                    <div className="flex items-center gap-3 md:col-start-2">
                      <span className="h-11 w-11 shrink-0 rounded-full bg-black/[0.06] md:h-12 md:w-12" />
                      <div className="space-y-2">
                        <span className="block h-4 w-32 rounded-full bg-black/[0.06]" />
                        <span className="block h-3 w-40 max-w-full rounded-full bg-black/[0.06]" />
                      </div>
                    </div>
                    <span className="hidden h-4 w-28 rounded-full bg-black/[0.06] md:col-start-3 md:block" />
                    <span className="hidden h-6 w-16 rounded-full bg-black/[0.06] md:block" />
                    <span className="h-10 w-20 rounded-full bg-black/[0.06] md:col-start-auto" />
                    <span className="col-span-2 ml-14 h-4 w-36 rounded-full bg-black/[0.06] md:hidden" />
                  </li>
                ))}
              </ul>
            ) : (
              <>
            {/* a new page fades the old list out, then the new rows arrive one after another */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul key={currentPage} exit={{ opacity: 0, transition: { duration: 0.15 } }} className="space-y-2 md:space-y-0">
                {/* rows that leave (search, delete) fade out; rows that come back fade in */}
                <AnimatePresence initial={false}>
                  {rows.map((u, i) => (
                    <motion.li
                      key={u.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: i * 0.04 } }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      className={rowCls}
                    >
                      <span className="hidden text-[15px] text-muted md:block">{first + i + 1}</span>

                      {/* user */}
                      <div className="order-1 flex min-w-0 items-center gap-3 md:order-none">
                        <Avatar name={u.name} src={u.image} className="h-11 w-11 text-sm md:h-12 md:w-12 md:text-base" />
                        <div className="min-w-0">
                          <p className="truncate font-medium leading-tight">{u.name}</p>
                          <p className="truncate text-sm text-muted">{u.email}</p>
                        </div>
                      </div>

                      {/* phone (tap to call on phones). On phones the status badge sits at the end of this line. */}
                      <div className="order-3 col-span-2 flex items-center justify-between gap-3 pl-14 md:contents">
                        <a
                          href={`tel:${u.phone.replace(/\s/g, "")}`}
                          className="flex items-center gap-2 text-sm md:order-none md:text-[15px]"
                        >
                          <Phone size={14} className="shrink-0 text-brand-600 md:hidden" />
                          {u.phone}
                        </a>
                        <span className="md:hidden"><StatusBadge status={u.status} /></span>
                      </div>

                      <span className="hidden md:block"><StatusBadge status={u.status} /></span>

                      <p className="order-4 col-span-2 flex items-start gap-2 pl-14 text-sm text-muted md:hidden xl:order-none xl:col-span-1 xl:flex xl:pl-0 xl:text-[15px]">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-brand-600 xl:hidden" />
                        <span className="min-w-0 xl:truncate">{u.address}</span>
                      </p>

                      <div className="order-2 flex justify-end md:order-none">
                        <button aria-label={`Edit ${u.name}`} onClick={() => modal.show(u)} className={`${iconBtn} !h-9 !w-9 bg-white md:bg-transparent`}>
                          <Pencil size={17} />
                        </button>
                        <button
                          aria-label={`Delete ${u.name}`}
                          disabled={u.id === currentUser.id}
                          onClick={() => usersApi.remove(u.id)}
                          className={`${iconBtn} !h-9 !w-9 ml-1 bg-white md:ml-0 md:bg-transparent`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            </AnimatePresence>

            {filtered.length === 0 && (
              <Empty
                title="No users found"
                text={users.length === 0 ? "Add your first user to get started." : "Try a different search."}
              />
            )}
              </>
            )}
          </div>
        </motion.div>

        {/* pagination: ‹ 2 / 5 › on phones, numbered pills from sm up */}
        {!loading && filtered.length > PAGE_SIZES[0] && (
          <div className="mt-3 flex flex-col gap-3 border-t border-black/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-2">
            <div className="flex items-center justify-between gap-3 text-sm text-muted sm:justify-start">
              <p>Showing {first + 1}-{first + rows.length} of {filtered.length}</p>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                aria-label="Rows per page"
                className="h-10 rounded-full bg-panel px-3 text-sm text-ink outline-none sm:h-9"
              >
                {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} per page</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between gap-1 sm:justify-start">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="grid h-11 w-11 place-items-center rounded-full bg-panel transition-colors hover:bg-brand-100 disabled:pointer-events-none disabled:opacity-40 sm:h-10 sm:w-10 sm:bg-transparent sm:hover:bg-panel"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="px-3 text-sm font-medium tabular-nums sm:hidden">{currentPage} / {totalPages}</span>

              <div className="hidden items-center gap-1 sm:flex">
                {pageList(currentPage, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={`gap-${i}`} className="grid h-10 w-6 place-items-center text-muted">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={`relative grid h-10 min-w-10 place-items-center rounded-full px-2 text-sm font-medium transition-colors ${
                        p === currentPage ? "text-white" : "hover:bg-panel"
                      }`}
                    >
                      {/* the dark pill slides from one page number to the next */}
                      {p === currentPage && (
                        <motion.span layoutId="users-page-pill" transition={{ duration: 0.4, ease }} className="absolute inset-0 rounded-full bg-brand-900" />
                      )}
                      <span className="relative">{p}</span>
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="grid h-11 w-11 place-items-center rounded-full bg-panel transition-colors hover:bg-brand-100 disabled:pointer-events-none disabled:opacity-40 sm:h-10 sm:w-10 sm:bg-transparent sm:hover:bg-panel"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <Modal open={modal.open} onClose={modal.hide} title={modal.item ? "Edit user" : "Add user"}>
        <UserForm user={modal.item} onSave={save} onCancel={modal.hide} />
      </Modal>
    </motion.div>
  );
}