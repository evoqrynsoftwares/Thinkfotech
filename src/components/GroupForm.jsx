import { useState } from "react";
import { Search } from "lucide-react";
import { users as seedUsers } from "../data";
import { Avatar, CheckRow, Field, FormActions, inputCls, matches } from "./UI";

/* ---------- create / edit form: name, description, pick members (with search) ---------- */
export default function GroupForm({ group, onSave, onCancel }) {
  // people to pick from. With an API: load them in a useEffect and keep them in state.
  const users = seedUsers;
  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [memberIds, setMemberIds] = useState(group?.memberIds ?? []);
  const [find, setFind] = useState("");

  const shown = users.filter((u) => matches(find, u.name, u.email));
  const toggle = (id) => setMemberIds((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  const selectShown = () => setMemberIds((list) => [...new Set([...list, ...shown.map((u) => u.id)])]);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave({ ...group, name: name.trim(), description, memberIds }); }}
      className="space-y-4"
    >
      <Field label="Group name">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Growth Team" className={inputCls} />
      </Field>
      <Field label="What does this group do?">
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the group's focus" className={inputCls} />
      </Field>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Members <span className="font-normal text-muted">({memberIds.length} selected)</span></p>
          <div className="flex gap-3 text-sm font-medium text-brand-700">
            <button type="button" onClick={selectShown} className="hover:underline">Select all</button>
            <button type="button" onClick={() => setMemberIds([])} className="hover:underline">Clear</button>
          </div>
        </div>

        <label className="mb-2 flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-3">
          <Search size={16} className="shrink-0 text-muted" />
          <input
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder="Search people"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>

        <div data-lenis-prevent className="max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-white p-1">
          {shown.map((u) => (
            <CheckRow key={u.id} checked={memberIds.includes(u.id)} onChange={() => toggle(u.id)}>
              <Avatar name={u.name} src={u.image} className="h-7 w-7 text-xs" />
              <span className="text-sm">{u.name}</span>
              <span className="ml-auto truncate pl-2 text-xs text-muted">{u.email}</span>
            </CheckRow>
          ))}
          {shown.length === 0 && <p className="p-3 text-sm text-muted">No people match your search.</p>}
        </div>
      </div>

      <FormActions onCancel={onCancel} submit={group ? "Save changes" : "Create group"} />
    </form>
  );
}
