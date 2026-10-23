import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Pencil, Plus, Trash2 } from "lucide-react";
import { departments, employeeStatuses, employees as seedEmployees } from "../data";
import {
  Avatar, Empty, Field, FormActions, Modal, PageHeader, StatusBadge, Tabs,
  btnPrimary, card, fmtDate, iconBtn, inputCls, itemMotion, rise, stagger, useCollection, useModal,
} from "./UI";

function EmployeeForm({ employee, onSave, onCancel }) {
  const [f, setF] = useState({
    name: employee?.name ?? "",
    title: employee?.title ?? "",
    department: employee?.department ?? departments[0],
    email: employee?.email ?? "",
    status: employee?.status ?? "Active",
    joined: employee?.joined ?? new Date().toISOString().slice(0, 10),
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-4">
      <Field label="Full name"><input required value={f.name} onChange={set("name")} className={inputCls} /></Field>
      <Field label="Job title"><input required value={f.title} onChange={set("title")} placeholder="e.g. Data Analyst" className={inputCls} /></Field>
      <Field label="Work email"><input required type="email" value={f.email} onChange={set("email")} className={inputCls} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Department">
          <select value={f.department} onChange={set("department")} className={inputCls}>
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select value={f.status} onChange={set("status")} className={inputCls}>
            {employeeStatuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Joined on"><input required type="date" value={f.joined} onChange={set("joined")} className={inputCls} /></Field>
      <FormActions onCancel={onCancel} submit={employee ? "Save changes" : "Add employee"} />
    </form>
  );
}

export default function Employees() {
  const [employees, employeesApi] = useCollection(seedEmployees, "Employee");
  const [tab, setTab] = useState("all");
  const modal = useModal();

  const rows = employees.filter((e) => tab === "all" || e.department === tab);
  const save = (f) => {
    modal.item ? employeesApi.update(modal.item.id, f) : employeesApi.add(f);
    modal.hide();
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader title="Employees" subtitle="Your staff directory, by department.">
        <button onClick={() => modal.show()} className={btnPrimary}><Plus size={20} /> Add employee</button>
      </PageHeader>

      <motion.div variants={rise} className="mt-6">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: "All", count: employees.length },
            ...departments.map((d) => ({ value: d, label: d, count: employees.filter((e) => e.department === d).length })),
          ]}
        />
      </motion.div>

      <motion.div variants={rise} className="relative mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {rows.map((e, i) => (
            <motion.article key={e.id} {...itemMotion(i)} className={`${card} flex flex-col`}>
              <div className="flex items-start justify-between">
                <Avatar name={e.name} className="h-14 w-14 text-lg" />
                <StatusBadge status={e.status} />
              </div>
              <h3 className="mt-4 text-lg font-medium leading-tight">{e.name}</h3>
              <p className="text-muted">{e.title}</p>
              <p className="mt-3 inline-flex w-fit rounded-full bg-panel px-3 py-1 text-xs font-medium">{e.department}</p>
              <p className="mt-4 flex items-center gap-2 truncate text-sm text-muted"><Mail size={14} className="shrink-0" /> <span className="truncate">{e.email}</span></p>
              <div className="-mb-2 -mr-2 mt-3 flex items-center justify-between">
                <span className="text-sm text-muted">Joined {fmtDate(e.joined, { month: "short", year: "numeric" })}</span>
                <div className="flex">
                  <button aria-label={`Edit ${e.name}`} onClick={() => modal.show(e)} className={iconBtn}><Pencil size={17} /></button>
                  <button aria-label={`Delete ${e.name}`} onClick={() => employeesApi.remove(e.id)} className={iconBtn}><Trash2 size={17} /></button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {rows.length === 0 && (
        <div className="mt-4"><Empty title="No employees found" text="Try another department or search term." /></div>
      )}

      <Modal open={modal.open} onClose={modal.hide} title={modal.item ? "Edit employee" : "Add employee"}>
        <EmployeeForm employee={modal.item} onSave={save} onCancel={modal.hide} />
      </Modal>
    </motion.div>
  );
}
