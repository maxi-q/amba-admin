import { useState } from "react";
import { X } from "lucide-react";
import { Button, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle, InputField, RadioGroup, RadioGroupItem } from "@senler/ui";
import "./participants.css";
import type { TeamRole } from "./TeamPreviewContext";

export const participantButtonClass = "h-7 rounded-md px-2 text-[13px] font-medium leading-4 tracking-[-0.0325px] shadow-none";
export const participantPrimaryClass = `${participantButtonClass} bg-[#2563eb] text-white hover:bg-[#2563eb]/90`;
export const participantSecondaryClass = `${participantButtonClass} border-[#e4e4e4] bg-white text-black hover:bg-[#f0f0f0]`;
const modalClass = "w-[358px] max-w-[calc(100vw-32px)] gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 text-black sm:max-w-[358px]";

function ModalHeader({ title, disabled }: { title: string; disabled?: boolean }) {
  return <DialogHeader className="h-11 flex-row items-center justify-between gap-4 space-y-0 px-4 py-2.5 text-left">
    <DialogTitle className="text-[15px] font-medium leading-5 tracking-[-0.135px]">{title}</DialogTitle>
    <DialogClose asChild><Button aria-label="Закрыть" variant="ghost" disabled={disabled} className="size-6 shrink-0 p-0 text-[#707070]"><X className="size-6" strokeWidth={1.5} /></Button></DialogClose>
  </DialogHeader>;
}

export function AddParticipantDialog({ open, onClose, onSubmit, isPending, error, initialTab, teamPreview }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: string, tab: "team" | "performers", role: Exclude<TeamRole, "owner">) => void;
  isPending: boolean;
  error?: string;
  initialTab: "team" | "performers";
  teamPreview: boolean;
}) {
  const [tab, setTab] = useState(initialTab);
  const [input, setInput] = useState("");
  const [role, setRole] = useState<Exclude<TeamRole, "owner">>("admin");
  return <DialogRoot open={open} onOpenChange={(next) => { if (!next && !isPending) onClose(); }}>
    <DialogContent data-participant-dialog showCloseButton={false} className={modalClass}>
      <form onSubmit={(event) => { event.preventDefault(); if ((tab === "performers" || teamPreview) && input.trim() && !isPending) onSubmit(input.trim(), tab, role); }}>
        <ModalHeader title="Добавить пользователя" disabled={isPending} />
        <DialogDescription className="sr-only">Добавление пользователя по ссылке на профиль VK</DialogDescription>
        <div className="flex flex-col gap-3 px-4 py-2">
          <div className="flex h-7 gap-0.5 rounded-md bg-[#f0f0f0] p-0.5" role="tablist" aria-label="Куда добавить пользователя">
            {([['team', 'В команду'], ['performers', 'В исполнители']] as const).map(([value, label]) => <Button key={value} type="button" role="tab" aria-selected={tab === value} variant="ghost" disabled={isPending} onClick={() => setTab(value)} className={`h-6 flex-1 rounded-sm p-1 text-[13px] font-medium leading-4 shadow-none ${tab === value ? "bg-white hover:bg-white" : "hover:bg-white/50"}`}>{label}</Button>)}
          </div>
          <div className="[&_[data-slot=field]]:gap-2 [&_label]:text-[13px] [&_label]:font-medium [&_label]:leading-4 [&_label]:text-[#797979]">
            <InputField label="Ссылка на профиль пользователя VK" aria-label="Ссылка на профиль пользователя VK" value={input} onChange={(event) => setInput(event.target.value)} disabled={isPending} className="h-10 rounded-md border-[#e4e4e4] bg-white px-3 text-[13px] font-medium shadow-none" />
          </div>
          {tab === "team" && <>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as Exclude<TeamRole, "owner">)} disabled={isPending} aria-label="Роль участника" className="gap-2">
              {([['admin', 'Администратор'], ['editor', 'Редактор'], ['viewer', 'Наблюдатель']] as const).map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium leading-4"><RadioGroupItem value={value} className="size-4 border-[#e4e4e4] bg-[#f0f0f0] text-[#2563eb] data-[state=checked]:border-[#2563eb]" />{label}</label>)}
            </RadioGroup>
            {!teamPreview && <p role="status" className="text-[13px] leading-4 text-[#797979]">Добавление в команду станет доступно после подключения API ролей.</p>}
          </>}
          {error && <p role="alert" className="text-[13px] leading-4 text-destructive">{error}</p>}
        </div>
        <DialogFooter className="flex-row justify-end px-4 py-2.5">
          <Button type="submit" disabled={isPending || !input.trim() || (tab === "team" && !teamPreview)} className={participantPrimaryClass}>{isPending ? "Добавление…" : "Добавить"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </DialogRoot>;
}

export function RemoveParticipantDialog({ open, onClose, onConfirm, isPending, error }: {
  open: boolean; onClose: () => void; onConfirm: () => void; isPending: boolean; error?: string;
}) {
  return <DialogRoot open={open} onOpenChange={(next) => { if (!next && !isPending) onClose(); }}>
    <DialogContent data-participant-dialog showCloseButton={false} className={modalClass}>
      <ModalHeader title="Удалить пользователя" disabled={isPending} />
      <DialogDescription className="px-4 py-2 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#797979]">Подтвердите удаление пользователя</DialogDescription>
      {error && <p role="alert" className="px-4 text-[13px] text-destructive">{error}</p>}
      <DialogFooter className="flex-row justify-end gap-2 px-4 py-2.5">
        <Button variant="outline" className={participantSecondaryClass} disabled={isPending} onClick={onClose}>Отмена</Button>
        <Button className={`${participantButtonClass} bg-[red] text-white hover:bg-[red]/90`} disabled={isPending} onClick={onConfirm}>{isPending ? "Удаление…" : "Удалить"}</Button>
      </DialogFooter>
    </DialogContent>
  </DialogRoot>;
}
