import { useState } from "react";
import { useParams } from "react-router-dom";
import { Check, Ellipsis, Info, Mail, Plus, Trash2, X } from "lucide-react";
import {
  Avatar,
  Button,
  CheckBox,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Input,
  PageLoader,
} from "@senler/ui";
import { toast } from "sonner";

import { filterParticipants } from "@/hooks/ambassador/participants";
import type { Participant } from "@/hooks/ambassador/participants";
import { useApproveRoomApplications } from "@/hooks/ambassador/useApproveRoomApplications";
import { useParticipantList } from "@/hooks/ambassador/useParticipantList";
import { CreativesPaginationControls } from "../creativetasks/components/CreativesPaginationControls";
import {
  AmbassadorInviteDialog,
  ApplicationDetailsDialog,
  RemoveParticipantDialog,
  participantPrimaryClass,
  participantSecondaryClass,
} from "./ParticipantDialogs";

const sections = [["active", "Активные"], ["applications", "Заявки"]] as const;
type VisibleSection = (typeof sections)[number][0];

const iconButtonClass = `${participantSecondaryClass} size-7 shrink-0 p-0 text-[#707070]`;
const PAGE_SIZE = 25;

export default function ApplicationsPage() {
  const { slug = "" } = useParams();
  const [section, setSection] = useState<VisibleSection>("active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<Participant | null>(null);
  const [removeTargets, setRemoveTargets] = useState<Participant[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const activeList = useParticipantList(slug, "active", true);
  const applicationsList = useParticipantList(slug, "applications", true);
  const list = section === "active" ? activeList : applicationsList;
  const approval = useApproveRoomApplications();
  const matches = filterParticipants(list.participants, search);
  const totalPages = Math.ceil(matches.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const visible = matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selected = matches.filter((participant) => selectedIds.has(participant.id));
  const selectedVisibleCount = visible.filter((participant) => selectedIds.has(participant.id)).length;
  const allVisibleSelected = visible.length > 0 && selectedVisibleCount === visible.length;

  const changeStatus = (
    ids: string[],
    status: "approved" | "rejected",
    successMessage: string,
    onSuccess?: () => void,
  ) => {
    if (!ids.length || approval.isPending) return;
    setProcessingId(ids.length === 1 ? ids[0] : "bulk");
    approval.approveRoomApplications({ ids, status }, {
      onSuccess: () => {
        setSelectedIds((current) => new Set([...current].filter((id) => !ids.includes(id))));
        toast.success(successMessage);
        onSuccess?.();
      },
      onSettled: () => setProcessingId(null),
    });
  };

  const moderate = (ids: string[], status: "approved" | "rejected") => {
    changeStatus(
      ids,
      status,
      ids.length === 1
        ? status === "approved" ? "Заявка одобрена" : "Заявка отклонена"
        : status === "approved" ? "Выбранные заявки одобрены" : "Выбранные заявки отклонены",
    );
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

  return <div className="participants-page min-h-full w-full bg-white text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
    <header className="flex h-12 items-center border-b border-[#e4e4e4] px-4">
      <h1 className="text-[13px] font-medium leading-4">Участники</h1>
    </header>

    <div className="flex min-h-12 items-center gap-2 border-b border-[#e4e4e4] px-4 py-[9px]">
      <div role="tablist" aria-label="Статусы исполнителей" className="flex h-7 shrink-0 gap-0.5 rounded-md bg-[#f0f0f0] p-0.5">
        {sections.map(([value, label]) => <Button
          type="button"
          key={value}
          role="tab"
          aria-selected={section === value}
          variant="ghost"
          onClick={() => {
            setSection(value);
            resetList();
          }}
          className={`h-6 rounded-sm px-1.5 py-1 text-[13px] font-medium leading-4 shadow-none ${section === value ? "bg-white hover:bg-white" : "hover:bg-white/50"}`}
        >
          {label}{value === "applications" && applicationsList.participants.length > 0 ? ` ${applicationsList.participants.length}` : ""}
        </Button>)}
      </div>
      <Input
        type="search"
        aria-label="Поиск участников"
        placeholder="Поиск..."
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
          setSelectedIds(new Set());
        }}
        className="h-7 min-w-32 flex-1 rounded-md border-0 bg-[#f0f0f0] px-2 py-1.5 text-[13px] font-medium leading-4 placeholder:text-[#636c72] shadow-none"
      />
      <Button className={`${participantPrimaryClass} gap-1`} onClick={() => setAddOpen(true)}>
        <Plus className="size-4" strokeWidth={1.5} />Добавить
      </Button>
    </div>

    <div className="min-w-0 w-full">
      {list.isPending
        ? <div className="flex min-h-32 items-center justify-center"><PageLoader label="Загрузка участников…" /></div>
        : list.isError
          ? <div role="alert" className="p-4">
              <p className="text-destructive">Не удалось загрузить участников: {list.error?.message}</p>
              <Button variant="outline" className={`${participantSecondaryClass} mt-3`} onClick={() => void list.refetch()}>Повторить</Button>
            </div>
          : <>
              {approval.error && <p role="alert" className="px-4 py-3 text-destructive">{approval.error.message || "Не удалось изменить статус пользователя"}</p>}
              {visible.length > 0 && <div className="flex h-12 items-center gap-3 border-b border-[#e4e4e4] px-4" aria-label="Массовые действия с участниками">
                <CheckBox
                  aria-label="Выбрать всех участников на странице"
                  checked={allVisibleSelected ? true : selectedVisibleCount > 0 ? "indeterminate" : false}
                  disabled={approval.isPending}
                  onCheckedChange={(checked) => selectParticipants(visible.map((participant) => participant.id), checked === true)}
                />
                <span className="min-w-0 flex-1">{selected.length ? `Выбрано: ${selected.length}` : "Выбрать все"}</span>
                {selected.length > 0 && <DropdownMenuRoot>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={iconButtonClass} aria-label="Действия с выбранными участниками">
                      <Ellipsis className="size-4" strokeWidth={1.5} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="participants-actions-menu rounded-lg border-[#e4e4e4] p-1 text-[13px] font-medium">
                    {section === "applications" ? <>
                      <DropdownMenuItem disabled={approval.isPending} onSelect={() => moderate(selected.map((participant) => participant.id), "approved")}>
                        <Check className="size-4" />Одобрить
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={approval.isPending} onSelect={() => moderate(selected.map((participant) => participant.id), "rejected")}>
                        <X className="size-4" />Отклонить
                      </DropdownMenuItem>
                    </> : <DropdownMenuItem disabled={approval.isPending} onSelect={() => setRemoveTargets(selected)}>
                      <Trash2 className="size-4" />Удалить
                    </DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenuRoot>}
              </div>}

              <ul aria-label={sections.find(([value]) => value === section)?.[1]} className="m-0 list-none p-0">
                {visible.length === 0
                  ? <li className="p-4 text-[#797979]">{search.trim() ? "Никого не найдено" : section === "active" ? "Пока нет активных исполнителей" : "Нет заявок на рассмотрение"}</li>
                  : visible.map((participant) => <li key={participant.id} className="flex h-12 items-center gap-3 border-b border-[#e4e4e4] px-4">
                      <CheckBox
                        aria-label={`Выбрать: ${participant.name}`}
                        checked={selectedIds.has(participant.id)}
                        disabled={approval.isPending}
                        onCheckedChange={(checked) => selectParticipants([participant.id], checked === true)}
                      />
                      <div className="flex min-w-0 flex-1 items-center gap-1.5">
                        <Avatar src={participant.avatarUrl} name={participant.name} size="sm" shape="rounded" className="size-6 rounded-lg border border-[#e4e4e4]" />
                        <span className="truncate" title={participant.name}>{participant.name}</span>
                      </div>
                      <div className={`flex shrink-0 items-center ${section === "applications" ? "gap-3" : "gap-1"}`}>
                        {section === "applications" ? <>
                          <Button
                            variant="outline"
                            className={`${participantSecondaryClass} gap-1`}
                            aria-label={`Открыть заявку: ${participant.name}`}
                            onClick={() => setDetailsTarget(participant)}
                          >
                            <Mail className="size-4" strokeWidth={1.5} />Заявка
                          </Button>
                          <div className="flex gap-1" aria-busy={processingId === participant.id}>
                            <Button aria-label={`Одобрить: ${participant.name}`} title="Одобрить" disabled={approval.isPending} className={`${participantPrimaryClass} size-7 p-0`} onClick={() => moderate([participant.id], "approved")}>
                              <Check className="size-4" strokeWidth={1.5} />
                            </Button>
                            <Button aria-label={`Отклонить: ${participant.name}`} title="Отклонить" disabled={approval.isPending} variant="outline" className={iconButtonClass} onClick={() => moderate([participant.id], "rejected")}>
                              <X className="size-4" strokeWidth={1.5} />
                            </Button>
                          </div>
                        </> : <>
                          <Button variant="outline" className={iconButtonClass} aria-label={`Информация: ${participant.name}`} title="Информация" onClick={() => setDetailsTarget(participant)}>
                            <Info className="size-4" strokeWidth={1.5} />
                          </Button>
                          <Button variant="outline" className={iconButtonClass} aria-label={`Удалить: ${participant.name}`} title="Удалить" disabled={approval.isPending} onClick={() => setRemoveTargets([participant])}>
                            <Trash2 className="size-4" strokeWidth={1.5} />
                          </Button>
                        </>}
                      </div>
                    </li>)}
              </ul>
              {totalPages > 1 && <CreativesPaginationControls className="mt-4" page={currentPage} totalPages={totalPages} onPageChange={setPage} />}
            </>}
    </div>

    {addOpen && <AmbassadorInviteDialog open roomId={slug} onClose={() => setAddOpen(false)} />}
    {detailsTarget && <ApplicationDetailsDialog
      open
      roomId={slug}
      participant={detailsTarget}
      title={section === "applications" ? "Заявка" : "Информация"}
      onClose={() => setDetailsTarget(null)}
    />}
    <RemoveParticipantDialog
      open={removeTargets.length > 0}
      onClose={() => setRemoveTargets([])}
      isPending={approval.isPending}
      error={approval.generalError}
      description={removeTargets.length > 1 ? `Подтвердите удаление пользователей: ${removeTargets.length}` : undefined}
      onConfirm={() => changeStatus(
        removeTargets.map((participant) => participant.id),
        "rejected",
        removeTargets.length > 1 ? "Пользователи удалены" : "Пользователь удалён",
        () => setRemoveTargets([]),
      )}
    />
  </div>;
}
