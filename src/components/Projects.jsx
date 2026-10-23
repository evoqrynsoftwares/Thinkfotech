import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, GraduationCap, Pencil, Plus, School, Trash2, UsersRound } from "lucide-react";
import { groups as seedGroups, projectCategories, projectStatuses, projects as seedProjects } from "../data";
import {
  CategoryIcon, Empty, Field, FormActions, Modal, PageHeader, ProgressBar, StatusBadge, Tabs,
  btnPrimary, card, fmtDate, iconBtn, inputCls, itemMotion, rise, stagger,
  useAutoCreate, useCollection, useModal,
} from "./UI";

function ProjectForm({ project, onSave, onCancel }) {
  const [f, setF] = useState({
    name: project?.name ?? "",
    client: project?.client ?? "",
    category: project?.category ?? "IoT",
    due: project?.due ?? "",
    status: project?.status ?? "Pending",
    progress: project?.progress ?? 0,
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const setStatus = (e) => {
    const status = e.target.value;
    setF((p) => ({ ...p, status, progress: status === "Ended" ? 100 : p.progress }));
  };
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...f, progress: Number(f.progress) }); }} className="space-y-4">
      <Field label="Project name">
        <input required value={f.name} onChange={set("name")} placeholder="e.g. Smart Dustbin" className={inputCls} />
      </Field>
      <Field label="School or college">
        <input required value={f.client} onChange={set("client")} placeholder="e.g. St. Mary's School" className={inputCls} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project type">
          <select value={f.category} onChange={set("category")} className={inputCls}>
            {projectCategories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Due date">
          <input required type="date" value={f.due} onChange={set("due")} className={inputCls} />
        </Field>
        <Field label="Status">
          <select value={f.status} onChange={setStatus} className={inputCls}>
            {projectStatuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label={`Progress: ${f.progress}%`}>
        <input type="range" min="0" max="100" value={f.progress} onChange={set("progress")} className="w-full accent-brand-700" />
      </Field>
      <FormActions onCancel={onCancel} submit={project ? "Save changes" : "Add project"} />
    </form>
  );
}

export default function Projects() {
  const [projects, projectsApi] = useCollection(seedProjects, "Project");
  const groups = seedGroups; // only used to show each project's group name
  const [tab, setTab] = useState("all");
  const modal = useModal();
  useAutoCreate(() => modal.show());

  const count = (s) => projects.filter((p) => p.status === s).length;
  const rows = projects
    .filter((p) => tab === "all" || p.status === tab)
    .sort((a, b) => a.due.localeCompare(b.due));

  const save = (f) => {
    modal.item ? projectsApi.update(modal.item.id, f) : projectsApi.add({ ...f, groupId: null });
    modal.hide();
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader title="Projects" subtitle="IoT and software projects for schools and colleges.">
        <button onClick={() => modal.show()} className={btnPrimary}><Plus size={20} /> Add project</button>
      </PageHeader>

      <motion.div variants={rise} className="mt-6">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: "All", count: projects.length },
            ...projectStatuses.map((s) => ({ value: s, label: s, count: count(s) })),
          ]}
        />
      </motion.div>

      <motion.div variants={rise} className="relative mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {rows.map((p, i) => {
            const group = groups.find((g) => g.id === p.groupId);
            
            return (
              <motion.article key={p.id} {...itemMotion(i)} className={`${card} flex flex-col`}>
                <div className="flex items-start gap-3">
                  <CategoryIcon category={p.category} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-medium leading-tight">{p.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                      <span className="truncate">{p.client}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
                  <StatusBadge status={p.status} />
                  <span className="rounded-full bg-panel px-3 py-1">{p.category}</span>
                  
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-muted">
                  <p className="flex items-center gap-2"><CalendarDays size={15} /> Due {fmtDate(p.due)}</p>
                  <p className="flex items-center gap-2"><UsersRound size={15} /> {group ? group.name : "No group assigned"}</p>
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted">Progress</span>
                    <span className="font-medium">{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} />
                </div>
                <div className="-mb-2 -mr-2 mt-3 flex justify-end">
                  <button aria-label={`Edit ${p.name}`} onClick={() => modal.show(p)} className={iconBtn}><Pencil size={17} /></button>
                  <button aria-label={`Delete ${p.name}`} onClick={() => projectsApi.remove(p.id)} className={iconBtn}><Trash2 size={17} /></button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {rows.length === 0 && (
        <div className="mt-4"><Empty title="No projects found" text="Change the filter or add a new project." /></div>
      )}

      <Modal open={modal.open} onClose={modal.hide} title={modal.item ? "Edit project" : "Add project"}>
        <ProjectForm project={modal.item} onSave={save} onCancel={modal.hide} />
      </Modal>
    </motion.div>
  );
}
