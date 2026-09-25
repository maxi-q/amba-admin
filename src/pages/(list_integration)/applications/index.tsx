import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Check, Ellipsis, Plus, Trash2, User, X } from "lucide-react";
import { Avatar, Button, CheckBox, DropdownMenuContent, DropdownMenuItem, DropdownMenuRoot, DropdownMenuSeparator, DropdownMenuTrigger, Input, PageLoader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@senler/ui";
import { toast } from "sonner";
import { useParticipantList } from "@/hooks/ambassador/useParticipantList";
import { filterParticipants } from "@/hooks/ambassador/participants";
import type { Participant, ParticipantSection } from "@/hooks/ambassador/participants";
import { useApproveRoomApplications } from "@/hooks/ambassador/useApproveRoomApplications";
import { useCreateInvitation } from "@/hooks/invitations/useCreateInvitation";
import { useDeleteInvitation } from "@/hooks/invitations/useDeleteInvitation";
import { useParseVkUserId } from "@/hooks/invitations/useParseVkUserId";
import { CreativesPaginationControls } from "../creativetasks/components/CreativesPaginationControls";
import LegacyApplicationsPage from "./LegacyApplicationsPage";
import { AddParticipantDialog, RemoveParticipantDialog, participantPrimaryClass, participantSecondaryClass } from "./ParticipantDialogs";
import { TeamPreviewContext, teamRoleLabels } from "./TeamPreviewContext";
import type { TeamRole } from "./TeamPreviewContext";

const sections = [ ["active", "Активные"], ["applications", "Заявки"], ["invitations", "Приглашения"] ] as const;
const iconButtonClass = `${participantSecondaryClass} size-7 shrink-0 p-0 text-[#707070]`;
const PAGE_SIZE = 25;

export default function ApplicationsPage() {
  const { slug = "" } = useParams();
  const [team, setTeam] = useState(useContext(TeamPreviewContext));
  const [tab, setTab] = useState<"team" | "performers">("performers");
  const [section, setSection] = useState<ParticipantSection>("active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [legacy, setLegacy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState("");
  const [removeTarget, setRemoveTarget] = useState<(Participant & { isTeam?: boolean }) | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const list = useParticipantList(slug, section, tab === "performers" && !legacy);
  const approval = useApproveRoomApplications();
  const creation = useCreateInvitation();
  const removal = useDeleteInvitation();
  const parseVk = useParseVkUserId();
  const isAdding = creation.isPending || parseVk.isPending;
  const matches = filterParticipants(tab === "team" ? team ?? [] : list.participants, search);
  const totalPages = Math.ceil(matches.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const visible = matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selected = matches.filter((participant) => selectedIds.has(participant.id));
  const allVisibleSelected = visible.length > 0 && visible.every((participant) => selectedIds.has(participant.id));

  const moderate = (ids: string[], status: "approved" | "rejected") => {
    if (!ids.length || approval.isPending || tab !== "performers" || section !== "applications") return;
    setProcessingId(ids.length === 1 ? ids[0] : "bulk");
    approval.approveRoomApplications({ ids, status }, {
      onSuccess: () => {
        setSelectedIds((current) => new Set([...current].filter((id) => !ids.includes(id))));
        toast.success(ids.length === 1
          ? status === "approved" ? "Заявка одобрена" : "Заявка отклонена"
          : status === "approved" ? "Выбранные заявки одобрены" : "Выбранные заявки отклонены");
      },
      onSettled: () => setProcessingId(null),
    });
  };

  const selectParticipants = (ids: string[], checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      ids.forEach((id) => checked ? next.add(id) : next.delete(id));
      return next;
    });
  };

  const resetList = () => {
    setSearch("");
    setPage(1);
    setSelectedIds(new Set());
  };

  const addParticipant = async (input: string, targetTab: "team" | "performers", role: Exclude<TeamRole, "owner">) => {
    setAddError("");
    try {
      const { vkUserId } = await parseVk.mutateAsync(input);
      if (targetTab === "team") {
        if (team === null) return;
        setTeam([...team, { id: crypto.randomUUID(), name: `VK · ${vkUserId}`, profileUrl: `https://vk.com/id${vkUserId}`, role }]);
        setTab("team");
        setAddOpen(false);
        resetList();
        toast.success("Пользователь добавлен в демо-команду; на сервере ничего не изменено");
        return;
      }
      creation.createInvitation({ roomId: slug, targets: [{ channelTypeId: 1, subscriberId: vkUserId }] }, {
        onSuccess: () => {
          setAddOpen(false);
          setTab("performers");
          setSection("invitations");
          resetList();
          toast.success("Приглашение создано");
        },
        onError: (error) => setAddError(error.message || "Не удалось создать приглашение"),
      });
    } catch (error) {
      setAddError(error instanceof Error ? error.message : "Не удалось определить профиль VK");
    }
  };

  if (legacy) return <div className="space-y-4"><Button variant="outline" onClick={() => setLegacy(false)}><ArrowLeft className="size-4" />Участники</Button><LegacyApplicationsPage /></div>;

  return <div className="participants-page min-h-full w-full bg-white text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
    <header className="flex h-12 items-center gap-2 border-b border-[#e4e4e4] px-4">
      <h1 className="flex-1 text-[13px] font-medium leading-4">Участники</h1>
      <Button variant="outline" className={`${participantSecondaryClass} text-[12px]`} onClick={() => { setTab(tab === "team" ? "performers" : "team"); resetList(); }}>{tab === "team" ? "Исполнители" : "Команда"}</Button>
    </header>
    <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-[#e4e4e4] px-4 py-[9px]">
      {tab === "performers" ? <div role="tablist" aria-label="Статусы исполнителей" className="flex h-7 shrink-0 gap-0.5 rounded-md bg-[#f0f0f0] p-0.5">
        {sections.map(([value, label]) => <Button type="button" key={value} role="tab" aria-selected={section === value} variant="ghost" onClick={() => { setSection(value); resetList(); }} className={`h-6 rounded-sm px-1.5 py-1 text-[13px] font-medium leading-4 shadow-none ${section === value ? "bg-white hover:bg-white" : "hover:bg-white/50"}`}>{label}</Button>)}
      </div> : <span className="shrink-0">Команда</span>}
      <Input type="search" aria-label="Поиск участников" placeholder="Поиск..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); setSelectedIds(new Set()); }} disabled={tab === "team" && !team} className="h-7 min-w-32 flex-1 rounded-md border-0 bg-[#f0f0f0] px-2 py-1.5 text-[13px] font-medium leading-4 placeholder:text-[#636c72] shadow-none" />
      <Button className={`${participantPrimaryClass} gap-1`} onClick={() => { setAddError(""); creation.reset(); setAddOpen(true); }}><Plus className="size-4" strokeWidth={1.5} />Добавить</Button>
    </div>
    <div className="min-w-0 w-full">
        {tab === "team" && team === null ? <div className="p-4 text-[#797979]">
          <p>Управление командой пока недоступно.</p>
          <p className="mt-2">Для списка участников и ролей требуется поддержка API.</p>
          <Button variant="link" className="mt-3 h-auto p-0 text-[13px]" onClick={() => setLegacy(true)}>Ранее созданные заявки по компании и событиям</Button>
        </div> : tab === "performers" && list.isPending ? <div className="flex min-h-32 items-center justify-center"><PageLoader label="Загрузка участников…" /></div>
        : tab === "performers" && list.isError ? <div role="alert" className="p-4"><p className="text-destructive">Не удалось загрузить участников: {list.error?.message}</p><Button variant="outline" className={`${participantSecondaryClass} mt-3`} onClick={() => void list.refetch()}>Повторить</Button></div>
        : <>
          {approval.error && <p role="alert" className="px-4 py-3 text-destructive">{approval.error.message || "Не удалось изменить статус заявки"}</p>}
          {tab === "performers" && visible.length > 0 && <div className="flex h-12 items-center gap-3 border-b border-[#e4e4e4] px-4" aria-label="Массовые действия с участниками">
            <CheckBox aria-label="Выбрать всех участников на странице" checked={allVisibleSelected ? true : selected.length > 0 ? "indeterminate" : false} disabled={approval.isPending} onCheckedChange={(checked) => selectParticipants(visible.map((participant) => participant.id), checked === true)} />
            <span className="min-w-0 flex-1">Выбрано: {selected.length}</span>
            <DropdownMenuRoot>
              <DropdownMenuTrigger asChild><Button variant="outline" className={iconButtonClass} aria-label="Действия с выбранными участниками"><Ellipsis className="size-4" strokeWidth={1.5} /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="participants-actions-menu rounded-lg border-[#e4e4e4] p-1 text-[13px] font-medium">
                {section === "applications" ? <>
                  <DropdownMenuItem disabled={!selected.length || approval.isPending} onSelect={() => moderate(selected.map((participant) => participant.id), "approved")}><Check className="size-4" />Одобрить</DropdownMenuItem>
                  <DropdownMenuItem disabled={!selected.length || approval.isPending} onSelect={() => moderate(selected.map((participant) => participant.id), "rejected")}><X className="size-4" />Отклонить</DropdownMenuItem>
                </> : <>
                  <DropdownMenuItem disabled aria-describedby="participants-bulk-unavailable"><Trash2 className="size-4" />Удалить</DropdownMenuItem>
                  <p id="participants-bulk-unavailable" className="max-w-56 px-1.5 py-2 text-[12px] leading-4 text-[#797979]">{section === "active" ? "Удаление действующих участников пока не поддерживается API." : "Массовая отмена приглашений пока недоступна. Отменяйте приглашения по одному."}</p>
                </>}
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={!selected.length || approval.isPending} onSelect={() => setSelectedIds(new Set())}>Снять выделение</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuRoot>
          </div>}
          <ul aria-label={tab === "team" ? "Демонстрационная команда" : sections.find(([value]) => value === section)?.[1]} className="m-0 list-none p-0">
            {visible.length === 0 ? <li className="p-4 text-[#797979]">{search.trim() ? "Никого не найдено" : tab === "team" ? "В команде пока нет участников" : section === "active" ? "Пока нет активных исполнителей" : section === "applications" ? "Нет заявок на рассмотрение" : "Пока нет приглашений"}</li> : visible.map((participant) => <li key={participant.id} className="flex h-12 items-center gap-3 border-b border-[#e4e4e4] px-4">
              {tab === "performers" && <CheckBox aria-label={`Выбрать: ${participant.name}`} checked={selectedIds.has(participant.id)} disabled={approval.isPending} onCheckedChange={(checked) => selectParticipants([participant.id], checked === true)} />}
              <div className="flex min-w-0 flex-1 items-center gap-1.5"><Avatar src={participant.avatarUrl} name={participant.name} size="sm" shape="rounded" className="size-6 rounded-lg border border-[#e4e4e4]" /><span className="truncate" title={participant.name}>{participant.name}</span></div>
              {tab === "team" && (participant.role === "owner" ? <span className="text-[#797979]">Владелец</span> : <Select value={participant.role} onValueChange={(value) => { setTeam(team?.map((item) => item.id === participant.id ? { ...item, role: value as TeamRole } : item) ?? null); toast.success("Роль изменена только на мок-стенде"); }}>
                  <SelectTrigger aria-label={`Роль: ${participant.name}`} className={`${participantSecondaryClass} h-7 w-auto gap-1 py-1.5`}><SelectValue /></SelectTrigger>
                  <SelectContent>{(["admin", "editor", "viewer"] as const).map((role) => <SelectItem key={role} value={role}>{teamRoleLabels[role]}</SelectItem>)}</SelectContent>
                </Select>)}
              <div className={`flex shrink-0 items-center ${tab === "performers" && section === "applications" ? "gap-3" : "gap-1"}`}>
                {participant.profileUrl ? <Button asChild variant="outline" className={iconButtonClass}><a href={participant.profileUrl} target="_blank" rel="noopener noreferrer" aria-label={`Профиль VK: ${participant.name}`} title="Открыть профиль VK"><User className="size-4" strokeWidth={1.5} /></a></Button> : <span title="API не вернул ссылку на профиль"><Button disabled variant="outline" className={iconButtonClass} aria-label={`Профиль недоступен: ${participant.name}`}><User className="size-4" strokeWidth={1.5} /></Button></span>}
                {tab === "team" ? <Button variant="outline" className={iconButtonClass} disabled={participant.role === "owner"} aria-label={`Удалить: ${participant.name}`} title="Удалить из демо-команды" onClick={() => { removal.reset(); setRemoveTarget({ ...participant, isTeam: true }); }}><Trash2 className="size-4" strokeWidth={1.5} /></Button> : section === "applications" ? <div className="flex gap-1" aria-busy={processingId === participant.id}>
                  <Button aria-label={`Одобрить: ${participant.name}`} title="Одобрить" disabled={approval.isPending} className={`${participantPrimaryClass} size-7 p-0`} onClick={() => moderate([participant.id], "approved")}><Check className="size-4" strokeWidth={1.5} /></Button>
                  <Button aria-label={`Отклонить: ${participant.name}`} title="Отклонить" disabled={approval.isPending} variant="outline" className={iconButtonClass} onClick={() => moderate([participant.id], "rejected")}><X className="size-4" strokeWidth={1.5} /></Button>
                </div> : <span title={section === "active" ? "Удаление действующего участника пока не поддерживается API" : participant.cancellationUnavailable ?? "Отменить приглашение"}>
                  <Button aria-label={`${section === "active" ? "Удалить" : "Отменить приглашение"}: ${participant.name}`} disabled={section === "active" || !!participant.cancellationUnavailable} variant="outline" className={iconButtonClass} onClick={() => { removal.reset(); setRemoveTarget(participant); }}>{section === "active" ? <Trash2 className="size-4" strokeWidth={1.5} /> : <X className="size-4" strokeWidth={1.5} />}</Button>
                </span>}
              </div>
            </li>)}
          </ul>
          {totalPages > 1 && <CreativesPaginationControls className="mt-4" page={currentPage} totalPages={totalPages} onPageChange={setPage} />}
          {tab === "team" && <p className="p-4 text-[12px] text-[#797979]">Демо-команда: изменения только на стенде, API команды пока нет. <Button variant="link" className="h-auto p-0 text-[12px]" onClick={() => setLegacy(true)}>Ранее созданные заявки</Button></p>}
        </>}
    </div>
    {addOpen && <AddParticipantDialog open initialTab={tab} teamPreview={team !== null} onClose={() => setAddOpen(false)} onSubmit={(input, targetTab, role) => void addParticipant(input, targetTab, role)} isPending={isAdding} error={addError} />}
    <RemoveParticipantDialog open={!!removeTarget} onClose={() => setRemoveTarget(null)} isPending={removal.isPending} error={removal.generalError} onConfirm={() => {
      if (removeTarget?.isTeam) {
        setTeam(team?.filter((item) => item.id !== removeTarget.id || item.role === "owner") ?? null);
        setRemoveTarget(null);
        toast.success("Пользователь удалён только из демо-команды");
        return;
      }
      if (!removeTarget?.invitationId || removeTarget.cancellationUnavailable) return;
      removal.deleteInvitation({ id: removeTarget.invitationId, roomId: slug }, { onSuccess: () => { setRemoveTarget(null); toast.success("Приглашение отменено"); } });
    }} />
  </div>;
}
