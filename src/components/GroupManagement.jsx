import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowLeft, Check, Copy, FileText, KeyRound, Pencil, Plus, Search, Sparkles, Trash2, UserMinus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { groups as seedGroups, materials as seedMaterials, users } from "../data";
import GroupForm from "./GroupForm";
import { useScrollLock } from "./SmoothScroll";
import {
  Avatar, CountUp, Empty, Modal, PageHeader,
  btnOutline, btnPrimary, card, ease, iconBtn, inputCls, matches, rise, stagger, useCollection, useModal,
} from "./UI";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MATERIAL_LIMIT = 10; // materials shown before you search

const randomCode = () =>
  "GRP-" + Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");

const emptyNote = "rounded-2xl bg-panel px-4 py-8 text-center text-sm text-muted";

export default function GroupManagement() {
  // the group comes from the URL (/groups/:groupId), so a refresh stays on this group
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groups, groupsApi] = useCollection(seedGroups, "Group", "created");
  const [materials, materialsApi] = useCollection(seedMaterials, "Material");
  const group = groups.find((g) => g.id === groupId);

  const [editingCode, setEditingCode] = useState(false);
  const [codeInput, setCodeInput] = useState(group?.code ?? "");
  const [copied, setCopied] = useState(false);
  const [find, setFind] = useState("");
  const [scope, setScope] = useState("all"); // "all" | "added"
  const editModal = useModal();
  const [confirmDelete, setConfirmDelete] = useState(false);
  useScrollLock(confirmDelete);

  useEffect(() => {
    if (!confirmDelete) return;
    const onKey = (e) => { if (e.key === "Escape") setConfirmDelete(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDelete]);

  if (!group) {
    return (
      <Empty title="Group not found" text="It may have been deleted.">
        <button onClick={() => navigate("/groups")} className={btnPrimary}>Back to groups</button>
      </Empty>
    );
  }

  /* ---------- saving ----------
     Every change goes through one function, so an API call is easy to swap in. */
  const updateGroup = (patch) => groupsApi.update(group.id, patch);
  const saveEdits = (g) => { groupsApi.update(group.id, g); editModal.hide(); };
  const deleteGroup = () => { setConfirmDelete(false); navigate("/groups"); groupsApi.remove(group.id); };
  const setMaterialGroup = (material, id) => materialsApi.update(material.id, { groupId: id });

  /* ---------- members ---------- */
  const members = group.memberIds.map((id) => users.find((u) => u.id === id)).filter(Boolean);
  const removeMember = (id) => updateGroup({ memberIds: group.memberIds.filter((x) => x !== id) });

  /* ---------- join code ---------- */
  const hasCode = Boolean(group.code);
  const showCodeInput = editingCode || !hasCode;
  const codeTaken = groups.some((g) => g.id !== group.id && g.code && g.code === codeInput.trim());

  const generateCode = () => {
    let code = randomCode();
    while (groups.some((g) => g.code === code)) code = randomCode();
    setCodeInput(code);
  };
  const saveCode = () => {
    updateGroup({ code: codeInput.trim() });
    setEditingCode(false);
  };
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(group.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard not available */ }
  };

  /* ---------- materials ----------
     "All" shows the first 10 until you search; "In this group" shows every added item. */
  const inGroup = materials.filter((m) => m.groupId === group.id).length;
  const found = materials.filter((m) => matches(find, m.title ?? m.name ?? "", m.type ?? ""));
  const scoped = scope === "added" ? found.filter((m) => m.groupId === group.id) : found;
  const limited = scope === "all" && !find;
  const visible = limited ? scoped.slice(0, MATERIAL_LIMIT) : scoped;

  return (
    <MotionConfig reducedMotion="user">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <PageHeader title={group.name} subtitle={group.description || "Manage members, the join code and study materials."}>
          <button onClick={() => navigate("/groups")} className={btnOutline}>
            <ArrowLeft size={18} /> Groups
          </button>
        </PageHeader>

        {/* bento grid: one column on phones (join code, numbers, members, materials, settings), mixed tiles on desktop */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:gap-4 xl:grid-cols-12">
          {/* join code */}
          <motion.section variants={rise} className={`${card} xl:col-span-5 xl:col-start-8 xl:row-start-1`}>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-[3px] border-brand-600 text-brand-600">
                <KeyRound size={19} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-medium leading-tight sm:text-xl">Join code</h3>
                <p className="text-sm text-muted">Share it so people can join this group</p>
              </div>
            </div>

            {showCodeInput ? (
              <>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                    maxLength={12}
                    placeholder="Type or generate a code"
                    aria-label="Join code"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    /* 16px text stops iOS from zooming the page when the field is focused */
                    className={`${inputCls} min-w-0 flex-1 font-mono text-base tracking-widest`}
                  />
                  <button onClick={generateCode} className={`${btnOutline} justify-center`}>
                    <Sparkles size={16} /> Generate
                  </button>
                </div>
                {codeTaken && <p className="mt-2 text-sm text-red-600">Another group already uses this code.</p>}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={saveCode}
                    disabled={!codeInput.trim() || codeTaken || codeInput === group.code}
                    className={`${btnPrimary} justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    Save code
                  </button>
                  {hasCode && (
                    <button onClick={() => { setEditingCode(false); setCodeInput(group.code); }} className={`${btnOutline} justify-center`}>
                      Cancel
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-4 flex items-center gap-1 rounded-2xl bg-panel py-2.5 pl-4 pr-2 sm:py-3">
                <span className="min-w-0 flex-1 break-all font-mono text-lg tracking-[0.14em] sm:text-2xl sm:tracking-[0.18em]">
                  {group.code}
                </span>
                <button aria-label="Copy code" onClick={copyCode} className={iconBtn}>
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                </button>
                <button aria-label="Edit code" onClick={() => { setCodeInput(group.code); setEditingCode(true); }} className={iconBtn}>
                  <Pencil size={17} />
                </button>
              </div>
            )}
          </motion.section>

          {/* quick numbers */}
          <motion.div variants={rise} className="grid grid-cols-2 gap-3 sm:gap-4 xl:col-span-5 xl:col-start-8 xl:row-start-2">
            <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-950 p-4 text-white shadow-[0_18px_30px_-14px_rgba(10,39,87,0.55)] sm:p-5">
              <p className="text-sm text-white/80 sm:text-base">Members</p>
              <p className="mt-1.5 text-4xl font-medium leading-none sm:mt-2 sm:text-5xl"><CountUp to={members.length} /></p>
            </div>
            <div className="rounded-3xl border border-black/[0.04] bg-card p-4 sm:p-5">
              <p className="text-sm text-muted sm:text-base">Materials</p>
              <p className="mt-1.5 text-4xl font-medium leading-none sm:mt-2 sm:text-5xl"><CountUp to={inGroup} /></p>
            </div>
          </motion.div>

          {/* members */}
          <motion.section variants={rise} className={`${card} xl:col-span-7 xl:col-start-1 xl:row-span-2 xl:row-start-1`}>
            <h3 className="text-lg font-medium sm:text-xl">Members</h3>
            <p className="mt-1 text-sm text-muted">{members.length} in this group</p>

            {/* data-lenis-prevent: Lenis leaves this list to native scrolling.
                overscroll-contain: reaching the top or bottom does not scroll the page behind it.
                touch-pan-y: vertical touch drags scroll the list on phones. */}
            <ul
              data-lenis-prevent
              className="mt-3 max-h-80 touch-pan-y divide-y divide-black/[0.06] overflow-y-auto overscroll-contain sm:mt-4 sm:max-h-[22rem]"
            >
              <AnimatePresence initial={false}>
                {members.map((u, i) => (
                  <motion.li
                    key={u.id}
                    layout="position"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease, delay: Math.min(i, 8) * 0.04 } }}
                    /* no height animation: it shifts the scroll position inside the list */
                    exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
                    className="flex items-center gap-3 py-2.5 sm:py-3"
                  >
                    <Avatar name={u.name} src={u.image} className="h-10 w-10 text-sm sm:h-11 sm:w-11" />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate font-medium">{u.name}</p>
                      <p className="mt-0.5 truncate text-sm text-muted">{u.email}</p>
                    </div>
                    {/* icon-only 44px target on phones, labelled from sm up */}
                    <button
                      onClick={() => removeMember(u.id)}
                      aria-label={`Remove ${u.name}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center gap-1.5 rounded-full text-sm font-medium text-red-600 transition-colors hover:bg-red-50 sm:w-auto sm:px-4"
                    >
                      <UserMinus size={17} /> <span className="hidden sm:inline">Remove</span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {members.length === 0 && (
              <p className={`mt-4 ${emptyNote}`}>No members yet. Use Edit group below to add people.</p>
            )}
          </motion.section>

          {/* materials */}
          <motion.section variants={rise} className={`${card} xl:col-span-12 xl:row-start-3`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div>
                <h3 className="text-lg font-medium sm:text-xl">Study materials</h3>
                <p className="mt-1 text-sm text-muted">{inGroup} added to this group</p>
              </div>
              <label className="flex h-12 w-full items-center gap-3 rounded-full bg-panel px-4 transition-shadow focus-within:ring-2 focus-within:ring-brand-600/40 sm:h-11 sm:w-72">
                <Search size={18} strokeWidth={1.6} className="shrink-0" />
                <input
                  type="search"
                  value={find}
                  onChange={(e) => setFind(e.target.value)}
                  placeholder="Search all materials"
                  aria-label="Search materials"
                  enterKeyHint="search"
                  className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
                />
                {find && (
                  <button
                    onClick={() => setFind("")}
                    aria-label="Clear search"
                    className="-mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:text-ink"
                  >
                    <X size={16} />
                  </button>
                )}
              </label>
            </div>

            {/* two views: everything, or only what is already in this group */}
            <div role="group" aria-label="Show materials" className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-panel p-1 sm:inline-grid sm:grid-cols-[auto_auto]">
              {[["all", "All materials"], ["added", `In this group (${inGroup})`]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setScope(key)}
                  aria-pressed={scope === key}
                  className={`h-10 rounded-full px-3 text-sm font-semibold transition-colors sm:px-5 ${
                    scope === key ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <ul className="mt-3 grid gap-2.5 sm:mt-4 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
              <AnimatePresence initial={false}>
                {visible.map((m, i) => {
                  const added = m.groupId === group.id;
                  const other = m.groupId && !added ? groups.find((g) => g.id === m.groupId)?.name : null;
                  const title = m.title ?? m.name;
                  return (
                    <motion.li
                      key={m.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease, delay: Math.min(i, 9) * 0.04 } }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      className="flex items-center gap-3 rounded-2xl bg-panel p-2.5 sm:p-3"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-brand-700">
                        <FileText size={19} strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0 flex-1 leading-snug">
                        {/* long titles wrap on phones instead of being cut to a few letters */}
                        <p className="break-words font-medium">{title}</p>
                        <p className="mt-0.5 truncate text-sm text-muted">
                          {added ? "In this group" : other ? `Moves from ${other}` : "Shared with everyone"}
                        </p>
                      </div>
                      {/* round 44px toggle on phones, labelled pill from sm up */}
                      <button
                        onClick={() => setMaterialGroup(m, added ? null : group.id)}
                        aria-pressed={added}
                        aria-label={`${title} in this group`}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors sm:w-auto sm:px-4 ${
                          added ? "bg-brand-900 text-white hover:bg-brand-700" : "border border-ink/70 hover:bg-ink hover:text-white"
                        }`}
                      >
                        {added ? <Check size={17} /> : <Plus size={17} />}
                        <span className="hidden sm:inline">{added ? "Added" : "Add"}</span>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            {find && scoped.length === 0 && <p className={`mt-4 ${emptyNote}`}>No materials match your search.</p>}
            {!find && scope === "added" && inGroup === 0 && (
              <p className={`mt-4 ${emptyNote}`}>Nothing added yet. Switch to All materials and tap + to add some.</p>
            )}
            {materials.length === 0 && <p className={`mt-4 ${emptyNote}`}>No study materials have been created yet.</p>}
            {limited && materials.length > MATERIAL_LIMIT && (
              <p className="mt-4 text-sm text-muted">
                Showing {MATERIAL_LIMIT} of {materials.length} materials. Search to find the rest.
              </p>
            )}
          </motion.section>

          {/* group settings: edit and delete */}
          <motion.section variants={rise} className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between xl:col-span-12 xl:row-start-4`}>
            <div>
              <h3 className="text-lg font-medium sm:text-xl">Group settings</h3>
              <p className="mt-1 text-sm text-muted">Rename the group, change who is in it, or delete it.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => editModal.show(group)} className={`${btnPrimary} justify-center`}>
                <Pencil size={17} /> Edit group
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-50 px-6 py-3 font-semibold text-red-700 transition-colors hover:bg-red-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <Trash2 size={17} /> Delete group
              </button>
            </div>
          </motion.section>
        </div>

        {/* edit group */}
        <Modal open={editModal.open} onClose={editModal.hide} title="Edit group">
          <GroupForm group={editModal.item} onSave={saveEdits} onCancel={editModal.hide} />
        </Modal>

        {/* delete confirmation: bottom sheet on phones, centred card on larger screens */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              key="delete-dialog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setConfirmDelete(false)}
              className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:p-4"
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-title"
                data-lenis-prevent
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 48, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 32 }}
                transition={{ duration: 0.4, ease }}
                className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-[2rem] bg-white p-5 text-center shadow-2xl sm:p-8"
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-100 text-red-600 ring-8 ring-red-50 sm:h-16 sm:w-16">
                  <Trash2 size={24} strokeWidth={1.8} />
                </span>
                <h3 id="delete-title" className="mt-4 text-xl font-medium tracking-tight sm:mt-5 sm:text-2xl">Delete this group?</h3>
                <p className="mt-2 text-sm text-muted sm:text-base">This can't be undone. People and materials are kept, they just leave the group.</p>

                <div className="mt-4 rounded-2xl bg-panel px-4 py-3 text-left sm:mt-5">
                  <p className="break-words font-medium">{group.name}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {members.length} {members.length === 1 ? "member" : "members"} · {inGroup} {inGroup === 1 ? "material" : "materials"}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6">
                  <button
                    autoFocus
                    onClick={() => setConfirmDelete(false)}
                    className="h-12 rounded-full border border-ink/20 text-sm font-semibold transition-colors hover:bg-panel"
                  >
                    Keep group
                  </button>
                  <button
                    onClick={deleteGroup}
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
    </MotionConfig>
  );
}