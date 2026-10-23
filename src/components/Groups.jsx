import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Settings2, Trash2, X } from "lucide-react";
import { groups as seedGroups } from "../data";
import GroupForm from "./GroupForm";
import { scrollToElement } from "./SmoothScroll";
import {
  Empty, Modal, PageHeader,
  btnPrimary, card, ease, iconBtn, matches, rise, stagger, useAutoCreate, useCollection, useGo, useModal,
} from "./UI";

const PAGE_SIZES = [6, 12, 24];

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

/* ---------- groups list ---------- */
export default function Groups() {
  const [groups, groupsApi] = useCollection(seedGroups, "Group", "created");
  const go = useGo();
  const modal = useModal();
  useAutoCreate(() => modal.show());

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  /* ---------- search + pagination ----------
     This runs in the browser on the full `groups` list.
     For an API, send search, page and pageSize as query params, e.g.
       GET /api/groups?search=growth&page=2&limit=6
     then use the returned `items` as `rows` and the returned `total` as `filtered.length`. */
  const filtered = groups.filter((g) => matches(search, g.name, g.description));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const first = (currentPage - 1) * pageSize;
  const rows = filtered.slice(first, first + pageSize);

  /* ---------- smooth height ----------
     The cards sit in a box whose height is animated, so the page grows and
     shrinks smoothly when the number of cards changes. */
  const boxRef = useRef(null);
  const gridRef = useRef(null);
  const [gridHeight, setGridHeight] = useState(null);
  useEffect(() => {
    const watcher = new ResizeObserver(([entry]) => setGridHeight(entry.contentRect.height));
    watcher.observe(gridRef.current);
    return () => watcher.disconnect();
  }, []);

  const goToPage = (p) => {
    setPage(p);
    scrollToElement(boxRef.current);
  };
  const changeSearch = (value) => { setSearch(value); setPage(1); };

  const save = (g) => {
    if (g.id) groupsApi.update(g.id, g);
    else groupsApi.add(g);
    modal.hide();
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader title="Groups" subtitle="Teams of people who share study materials.">
        <button onClick={() => modal.show()} className={btnPrimary}>
          <Plus size={20} /> Create group
        </button>
      </PageHeader>

      <motion.div variants={rise} className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <label className="flex h-12 w-full items-center gap-3 rounded-full bg-white px-4 sm:max-w-sm">
          <Search size={19} strokeWidth={1.6} className="shrink-0" />
          <input
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder="Search groups"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
          />
          {search && (
            <button onClick={() => changeSearch("")} aria-label="Clear search" className="text-muted hover:text-ink">
              <X size={16} />
            </button>
          )}
        </label>
        <p className="text-sm text-muted">{filtered.length} {filtered.length === 1 ? "group" : "groups"}</p>
      </motion.div>

      <motion.div
        ref={boxRef}
        initial={false}
        animate={{ height: gridHeight === null ? "auto" : gridHeight + 16 }}
        transition={{ duration: 0.45, ease }}
        className="-mx-2 -mb-2 mt-2 scroll-mt-4 overflow-hidden p-2"
      >
        <div ref={gridRef}>
          {/* a new page fades the old cards out, then the new cards arrive one after another */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
        <AnimatePresence>
          {rows.map((g, i) => {
            return (
              <motion.article
                key={g.id}
                layout="position"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: Math.min(i, 8) * 0.05 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className={`${card} flex flex-col`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 truncate text-xl font-medium leading-tight">{g.name}</h3>
                  <span className="pr-2 text-xs text-muted">20-05-2025 </span>

                </div>
                <p className="mt-1 line-clamp-2 min-h-[2.75rem] text-muted">{g.description || "No description yet."}</p>

                <p className="mt-4 flex-1 text-sm font-medium">
                  {g.memberIds.length} {g.memberIds.length === 1 ? "member" : "members"}
                </p>

                <button
                  onClick={() => go("group-management", false, g.id)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <Settings2 size={16} /> Manage
                </button>
              </motion.article>
            );
          })}
        </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-4">
          {groups.length === 0 ? (
            <Empty title="No groups yet" text="Create a group to bring people together.">
              <button onClick={() => modal.show()} className={btnPrimary}><Plus size={18} /> Create group</button>
            </Empty>
          ) : (
            <Empty title="No groups found" text="Try a different search." />
          )}
        </div>
      )}

      {/* pagination */}
      {filtered.length > PAGE_SIZES[0] && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white px-4 py-3">
          <div className="flex items-center gap-3 text-sm text-muted">
            <p>Showing {first + 1} to {first + rows.length} of {filtered.length}</p>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              aria-label="Groups per page"
              className="h-9 rounded-full bg-panel px-3 text-sm text-ink outline-none"
            >
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} per page</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-panel disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

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
                    <motion.span layoutId="groups-page-pill" transition={{ duration: 0.4, ease }} className="absolute inset-0 rounded-full bg-brand-900" />
                  )}
                  <span className="relative">{p}</span>
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-panel disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <Modal open={modal.open} onClose={modal.hide} title={modal.item ? "Edit group" : "Create group"}>
        <GroupForm group={modal.item} onSave={save} onCancel={modal.hide} />
      </Modal>
    </motion.div>
  );
}