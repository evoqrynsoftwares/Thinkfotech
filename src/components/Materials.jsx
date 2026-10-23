import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, FileText, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { materials as seedMaterials } from "../data";
import { scrollToElement, useScrollLock } from "./SmoothScroll";
import {
  Empty, Field, FormActions, Modal, PageHeader,
  btnPrimary, card, ease, fmtDate, iconBtn, inputCls, matches, rise, stagger, useAutoCreate, useCollection, useModal,
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

/* ---------- add / edit form: name, description, Google Drive link ---------- */
function MaterialForm({ material, onSave, onCancel }) {
  const [f, setF] = useState({
    title: material?.title ?? "",
    description: material?.description ?? "",
    url: material?.url && material.url !== "#" ? material.url : "",
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...f, title: f.title.trim(), url: f.url.trim() }); }} className="space-y-4">
      <Field label="Name">
        <input required value={f.title} onChange={set("title")} placeholder="e.g. Arduino basics workbook" className={inputCls} />
      </Field>
      <Field label="Description">
        <textarea rows={3} value={f.description} onChange={set("description")} placeholder="What is this material about?" className={inputCls} />
      </Field>
      <Field label="Google Drive link">
        <input required type="url" value={f.url} onChange={set("url")} placeholder="https://drive.google.com/..." className={inputCls} />
        <p className="mt-1.5 text-xs text-muted">Set sharing to "Anyone with the link" so people can open it.</p>
      </Field>
      <FormActions onCancel={onCancel} submit={material ? "Save changes" : "Add material"} />
    </form>
  );
}

export default function Materials() {
  const [materials, materialsApi] = useCollection(seedMaterials, "Material");
  const modal = useModal();
  useAutoCreate(() => modal.show());

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [toDelete, setToDelete] = useState(null); // the material waiting for delete confirmation
  useScrollLock(Boolean(toDelete));

  /* ---------- search + pagination ----------
     This runs in the browser on the full `materials` list, newest first.
     For an API, send search, page and pageSize as query params, e.g.
       GET /api/materials?search=arduino&page=2&limit=6
     then use the returned `items` as `rows` and the returned `total` as `filtered.length`. */
  const filtered = materials
    .filter((m) => matches(search, m.title, m.description ?? ""))
    .sort((a, b) => (b.added ?? "").localeCompare(a.added ?? ""));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const first = (currentPage - 1) * pageSize;
  const rows = filtered.slice(first, first + pageSize);

  // escape closes the delete dialog
  useEffect(() => {
    if (!toDelete) return;
    const onKey = (e) => { if (e.key === "Escape") setToDelete(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toDelete]);

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

  /* ---------- actions ---------- */
  const goToPage = (p) => {
    setPage(p);
    scrollToElement(boxRef.current);
  };
  const changeSearch = (value) => { setSearch(value); setPage(1); };
  const save = (f) => {
    if (modal.item) materialsApi.update(modal.item.id, f);
    else materialsApi.add({ ...f, groupId: null, added: new Date().toISOString().slice(0, 10) });
    modal.hide();
  };
  const confirmDelete = () => {
    materialsApi.remove(toDelete.id);
    setToDelete(null);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader title="Study Materials" subtitle="Share Google Drive files and links with your teams.">
        <button onClick={() => modal.show()} className={btnPrimary}><Plus size={20} /> Add material</button>
      </PageHeader>

      {/* search */}
      <motion.div variants={rise} className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <label className="flex h-12 w-full items-center gap-3 rounded-full bg-white px-4 sm:max-w-sm">
          <Search size={19} strokeWidth={1.6} className="shrink-0" />
          <input
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder="Search materials"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
          />
          {search && (
            <button onClick={() => changeSearch("")} aria-label="Clear search" className="text-muted hover:text-ink">
              <X size={16} />
            </button>
          )}
        </label>
        <p className="text-sm text-muted">{filtered.length} {filtered.length === 1 ? "material" : "materials"}</p>
      </motion.div>

      {/* cards */}
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
                {rows.map((m, i) => {
                  const hasLink = m.url && m.url !== "#";
                  return (
                    <motion.article
                      key={m.id}
                      layout="position"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: Math.min(i, 8) * 0.05 } }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      className={`${card} flex flex-col`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-[3px] border-brand-600 text-brand-600">
                          <FileText size={18} strokeWidth={2.2} />
                        </span>
                        <div className="min-w-0 flex-1 leading-tight">
                          <h3 className="truncate text-lg font-medium">
                            {hasLink ? (
                              <a href={m.url} target="_blank" rel="noreferrer" className="hover:underline">{m.title}</a>
                            ) : m.title}
                          </h3>
                          <p className="mt-0.5 text-sm text-muted">Added {fmtDate(m.added)}</p>
                        </div>
                        <div className="-mr-2 -mt-1 flex shrink-0">
                          <button aria-label={`Edit ${m.title}`} onClick={() => modal.show(m)} className={iconBtn}><Pencil size={17} /></button>
                          <button aria-label={`Delete ${m.title}`} onClick={() => setToDelete(m)} className={iconBtn}><Trash2 size={17} /></button>
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-3 min-h-[4.5rem] flex-1 text-muted">{m.description || "No description yet."}</p>

                      {hasLink ? (
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                        >
                          Open material <ArrowUpRight size={16} />
                        </a>
                      ) : (
                        <button
                          onClick={() => modal.show(m)}
                          className="mt-5 flex w-full items-center justify-center rounded-full bg-panel py-3 text-sm font-medium text-muted transition-colors hover:text-ink"
                        >
                          No link yet. Add one
                        </button>
                      )}
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
          {materials.length === 0 ? (
            <Empty title="No materials yet" text="Add a Google Drive link to share your first material.">
              <button onClick={() => modal.show()} className={btnPrimary}><Plus size={18} /> Add material</button>
            </Empty>
          ) : (
            <Empty title="No materials found" text="Try a different search." />
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
              aria-label="Materials per page"
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
                    <motion.span layoutId="materials-page-pill" transition={{ duration: 0.4, ease }} className="absolute inset-0 rounded-full bg-brand-900" />
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

      {/* add / edit */}
      <Modal open={modal.open} onClose={modal.hide} title={modal.item ? "Edit material" : "Add material"}>
        <MaterialForm material={modal.item} onSave={save} onCancel={modal.hide} />
      </Modal>

      {/* delete confirmation: bottom sheet on phones, centred card on larger screens */}
      <AnimatePresence>
        {toDelete && (
          <motion.div
            key="delete-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setToDelete(null)}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 p-3 backdrop-blur-sm sm:items-center sm:p-4"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-title"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 48, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.4, ease }}
              className="w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-2xl sm:p-8"
            >
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-600 ring-8 ring-red-50">
                <Trash2 size={26} strokeWidth={1.8} />
              </span>
              <h3 id="delete-title" className="mt-5 text-2xl font-medium tracking-tight">Delete this material?</h3>
              <p className="mt-2 text-muted">This removes it from the list for everyone. The file in Google Drive is not touched.</p>

              <div className="mt-5 rounded-2xl bg-panel px-4 py-3 text-left">
                <p className="truncate font-medium">{toDelete.title}</p>
                <p className="mt-0.5 text-sm text-muted">Added {fmtDate(toDelete.added)}</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  autoFocus
                  onClick={() => setToDelete(null)}
                  className="h-12 rounded-full border border-ink/20 text-sm font-semibold transition-colors hover:bg-panel"
                >
                  Keep it
                </button>
                <button
                  onClick={confirmDelete}
                  className="h-12 rounded-full bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Yes, delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}