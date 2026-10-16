import { useState } from "react";
import { ArrowLeft, Plus, User, X } from "lucide-react";
import { Avatar, Button, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle, Input, InputField, RadioGroup, RadioGroupItem, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@senler/ui";
import { toast } from "sonner";
import type { RegistrationQuestionDto } from "@/api/generated/model";
import channelFallbackIcon from "@/assets/participants/channel-fallback.svg";
import contentCopyIcon from "@/assets/participants/content-copy.svg";
import closeIcon from "@/assets/ord-profile/close.svg";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useReplaceRegistrationQuestions } from "@/hooks/rooms/useReplaceRegistrationQuestions";
import { useRoomSenlerIoChannels, useRoomSenlerIoPreapprovedLinks } from "@/hooks/rooms/useRoomSenlerIoInvitations";
import { useRegistrationAnswers } from "@/hooks/ambassador/useRegistrationAnswers";
import type { Participant } from "@/hooks/ambassador/participants";
import "./participants.css";
import type { TeamRole } from "./TeamPreviewContext";

export const participantButtonClass = "h-7 rounded-md px-2 text-[13px] font-medium leading-4 tracking-[-0.0325px] shadow-none";
export const participantPrimaryClass = `${participantButtonClass} bg-[#2563eb] text-white hover:bg-[#2563eb]/90`;
export const participantSecondaryClass = `${participantButtonClass} border-[#e4e4e4] bg-white text-black hover:bg-[#f0f0f0]`;
const modalClass = "w-[358px] max-w-[calc(100vw-32px)] gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 text-black shadow-none sm:max-w-[358px]";

function ModalHeader({ title, disabled, onBack }: { title: string; disabled?: boolean; onBack?: () => void }) {
  return <DialogHeader className="h-11 flex-row items-center justify-between gap-4 space-y-0 px-4 py-2.5 text-left">
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {onBack && <Button type="button" aria-label="Назад" variant="ghost" disabled={disabled} onClick={onBack} className="size-6 shrink-0 p-0 hover:bg-transparent"><ArrowLeft className="size-4" strokeWidth={1.5} /></Button>}
      <DialogTitle className="truncate text-[15px] font-medium leading-5 tracking-[-0.135px]">{title}</DialogTitle>
    </div>
    {!onBack && <DialogClose asChild><Button aria-label="Закрыть" variant="ghost" disabled={disabled} className="size-6 shrink-0 p-0 hover:bg-transparent"><img src={closeIcon} alt="" className="size-6" /></Button></DialogClose>}
  </DialogHeader>;
}

function AnswerValue({ value }: { value: string }) {
  const lines = value.split(/\r?\n/).filter(Boolean);
  return <div className="flex flex-col gap-0.5 whitespace-pre-wrap break-words">
    {lines.length ? lines.map((line, index) => /^https?:\/\//i.test(line.trim())
      ? <a key={`${line}-${index}`} href={line.trim()} target="_blank" rel="noopener noreferrer" className="text-[#2563eb] underline underline-offset-2">Ссылка</a>
      : <span key={`${line}-${index}`}>{line}</span>) : <span>—</span>}
  </div>;
}

export function ApplicationDetailsDialog({ open, roomId, participant, title, onClose }: {
  open: boolean;
  roomId: string;
  participant: Participant;
  title: string;
  onClose: () => void;
}) {
  const application = participant.application;
  const answers = useRegistrationAnswers(roomId, application?.id ?? "", open && Boolean(application));

  return <DialogRoot open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <DialogContent data-participant-dialog showCloseButton={false} className={modalClass}>
      <ModalHeader title={title} />
      <DialogDescription className="sr-only">Информация о заявке пользователя</DialogDescription>
      <div className="max-h-[calc(100vh-184px)] overflow-y-auto px-4 py-2">
        <Avatar src={participant.avatarUrl} name={participant.name} size="sm" shape="rounded" className="mb-4 size-[52px] rounded-[14px] border border-[#e4e4e4]" />
        <dl className="flex flex-col gap-3 text-[13px] font-medium leading-4 tracking-[-0.0325px]">
          <div className="flex flex-col gap-1">
            <dt className="text-[#797979]">ФИО</dt>
            <dd>{application?.name || participant.name}</dd>
          </div>
          {application?.inn != null && <div className="flex flex-col gap-1">
            <dt className="text-[#797979]">ИНН</dt>
            <dd>{application.inn}</dd>
          </div>}
          {answers.isPending && <div className="text-[#797979]">Загрузка ответов…</div>}
          {answers.isError && <div role="alert" className="flex items-center justify-between gap-3 text-destructive">
            <span>Не удалось загрузить ответы</span>
            <Button type="button" variant="link" className="h-auto p-0 text-[13px]" onClick={() => void answers.refetch()}>Повторить</Button>
          </div>}
          {answers.data?.map((answer) => <div key={answer.id} className="flex flex-col gap-1">
            <dt className="text-[#797979]">{answer.question.text}</dt>
            <dd><AnswerValue value={answer.text} /></dd>
          </div>)}
        </dl>
      </div>
      <DialogFooter className="flex-row justify-end px-4 py-2.5">
        {participant.profileUrl
          ? <Button asChild variant="outline" className={`${participantSecondaryClass} gap-1`}><a href={participant.profileUrl} target="_blank" rel="noopener noreferrer"><User className="size-4" strokeWidth={1.5} />Профиль</a></Button>
          : <Button type="button" variant="outline" className={`${participantSecondaryClass} gap-1`} disabled><User className="size-4" strokeWidth={1.5} />Профиль</Button>}
      </DialogFooter>
    </DialogContent>
  </DialogRoot>;
}

function InvitationLinkField({ ariaLabel, url, isLoading, helperText }: {
  ariaLabel: string;
  url: string;
  isLoading: boolean;
  helperText: string;
}) {
  const copyLink = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Ссылка скопирована");
    } catch {
      toast.error("Не удалось скопировать ссылку");
    }
  };

  return <div className="flex w-full flex-col gap-1">
    <div className="relative">
      <Input readOnly aria-label={ariaLabel} value={url} placeholder={isLoading ? "Загрузка…" : "Ссылка недоступна"} className="h-10 w-full rounded-md border-[#e4e4e4] bg-white px-3 pr-10 text-[13px] font-medium tracking-[-0.0325px] text-black shadow-none" />
      <Button type="button" variant="ghost" aria-label={`Скопировать: ${ariaLabel.toLowerCase()}`} title="Скопировать ссылку" disabled={!url} onClick={() => void copyLink()} className="absolute right-2 top-2 size-6 p-1 hover:bg-transparent">
        <img src={contentCopyIcon} alt="" className="size-4" />
      </Button>
    </div>
    <p className="text-[12px] font-medium leading-4 text-[#797979]">{helperText}</p>
  </div>;
}

function ChannelAvatar({ avatarUrl, name }: { avatarUrl: string | null; name: string | null }) {
  if (avatarUrl) {
    return <Avatar src={avatarUrl} name={name ?? "Канал"} size="sm" shape="rounded" className="size-[22px] rounded-lg" />;
  }

  return <span className="flex size-[22px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e4e4e4] bg-[#141414]">
    <img src={channelFallbackIcon} alt="" className="h-[11px] w-[14px]" />
  </span>;
}

function RegistrationQuestionsDialog({ open, roomId, questions, onClose }: {
  open: boolean;
  roomId: string;
  questions: RegistrationQuestionDto[];
  onClose: () => void;
}) {
  const mutation = useReplaceRegistrationQuestions(roomId);
  const [draft, setDraft] = useState<Array<{ id?: string; text: string }>>(() => {
    const current = questions.map(({ id, text }) => ({ id, text }));
    return current.length ? current : [{ text: "" }];
  });

  const save = () => {
    const normalized = draft
      .map((question) => ({ ...question, text: question.text.trim() }))
      .filter((question) => question.text);

    mutation.mutate({ questions: normalized }, {
      onSuccess: () => {
        toast.success("Дополнительные вопросы сохранены");
        onClose();
      },
      onError: () => toast.error("Не удалось сохранить вопросы"),
    });
  };

  return <DialogRoot open={open} onOpenChange={(next) => { if (!next && !mutation.isPending) onClose(); }}>
    <DialogContent data-participant-dialog showCloseButton={false} className={modalClass}>
      <ModalHeader title="Дополнительные вопросы" disabled={mutation.isPending} onBack={onClose} />
      <DialogDescription className="sr-only">Вопросы, которые пользователь увидит при регистрации</DialogDescription>
      <div className="flex flex-col gap-2 px-4 py-2">
        {draft.length > 0 && <div className="overflow-hidden rounded-md border border-[#e4e4e4]">
          {draft.map((question, index) => <div key={question.id ?? index} className="relative border-b border-[#e4e4e4] last:border-b-0">
            <Input
              aria-label={`Вопрос ${index + 1}`}
              placeholder="Напишите вопрос пользователю"
              value={question.text}
              maxLength={2000}
              disabled={mutation.isPending}
              onChange={(event) => setDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item))}
              className="h-10 w-full rounded-none border-0 bg-white px-3 pr-10 text-[13px] font-medium shadow-none focus-visible:ring-0"
            />
            <Button type="button" variant="ghost" aria-label={`Удалить вопрос ${index + 1}`} disabled={mutation.isPending} onClick={() => setDraft((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-2 top-2 size-6 p-0 text-[#707070] hover:bg-transparent">
              <X className="size-4" strokeWidth={1.5} />
            </Button>
          </div>)}
        </div>}
        <Button type="button" variant="link" disabled={mutation.isPending} onClick={() => setDraft((current) => [...current, { text: "" }])} className="h-4 justify-start gap-1 p-0 text-[13px] font-medium leading-4 text-[#2563eb] no-underline hover:no-underline">
          <Plus className="size-4" strokeWidth={1.5} />Добавить вопрос
        </Button>
        {mutation.error && <p role="alert" className="text-[12px] leading-4 text-destructive">Не удалось сохранить вопросы</p>}
      </div>
      <DialogFooter className="flex-row justify-end gap-2 px-4 py-2.5">
        <Button type="button" variant="outline" className={participantSecondaryClass} disabled={mutation.isPending} onClick={onClose}>Отмена</Button>
        <Button type="button" className={participantPrimaryClass} disabled={mutation.isPending || draft.some((question) => !question.text.trim())} onClick={save}>{mutation.isPending ? "Сохранение…" : "Сохранить"}</Button>
      </DialogFooter>
    </DialogContent>
  </DialogRoot>;
}

export function AmbassadorInviteDialog({ open, roomId, onClose }: {
  open: boolean;
  roomId: string;
  onClose: () => void;
}) {
  const { room, isLoading: isRoomLoading, isError: isRoomError } = useGetRoomById(roomId);
  const channelsQuery = useRoomSenlerIoChannels(roomId);
  const [mode, setMode] = useState<"moderated" | "direct">("moderated");
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [preferredChannelId, setPreferredChannelId] = useState("");
  const channels = channelsQuery.data ?? [];
  const availableChannels = channels.filter((channel) => channel.registrationSupported && !channel.isPaused);
  const defaultChannelId = availableChannels.find((channel) => channel.url)?.id
    ?? availableChannels[0]?.id
    ?? "";
  const selectedChannelId = availableChannels.some((channel) => channel.id === preferredChannelId)
    ? preferredChannelId
    : defaultChannelId;
  const selectedChannel = channels.find((channel) => channel.id === selectedChannelId);
  const linksQuery = useRoomSenlerIoPreapprovedLinks(roomId, selectedChannelId, mode === "direct");
  const channelLink = selectedChannel?.url ?? "";
  const preapprovedLink = linksQuery.data?.links.find((link) => link.status === "available" && link.url)?.url ?? "";
  const questions = room?.registrationQuestions ?? [];
  const isLoading = isRoomLoading || channelsQuery.isLoading || (mode === "direct" && linksQuery.isLoading);
  const hasLoadError = isRoomError || channelsQuery.isError || (mode === "direct" && linksQuery.isError);

  return <>
    <DialogRoot open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent data-participant-dialog showCloseButton={false} className={modalClass}>
        <ModalHeader title="Добавить пользователя" />
        <DialogDescription className="sr-only">Ссылка для приглашения амбассадора в компанию</DialogDescription>
        <div className="flex flex-col gap-3 px-4 pb-4 pt-2">
          <div className="flex flex-col gap-2">
            <div className="flex h-7 gap-0.5 rounded-md bg-[#f0f0f0] p-0.5" role="tablist" aria-label="Способ приглашения">
              {([['moderated', 'С модерацией'], ['direct', 'Напрямую']] as const).map(([value, label]) => <Button key={value} type="button" role="tab" aria-selected={mode === value} variant="ghost" onClick={() => setMode(value)} className={`h-6 flex-1 rounded-sm border-0 p-1 text-[13px] font-medium leading-4 shadow-none outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${mode === value ? "bg-white hover:bg-white" : "hover:bg-white/50"}`}>{label}</Button>)}
            </div>
            <p className="text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#797979]">
              {mode === "moderated" ? "Вы оцениваете пользователя прежде, чем сделать его амбассадором" : "Пользователь сразу становится амбассадором"}
            </p>
          </div>

          {mode === "moderated" && <div className="flex flex-col gap-1 rounded-[10px] bg-[#f0f0f0] p-2 text-[13px] font-medium leading-4 tracking-[-0.0325px]">
            {questions.length ? <>
              <p className="text-[#797979]">Дополнительные вопросы</p>
              <ol className="list-decimal pl-[19.5px]">
                {questions.map((question) => <li key={question.id}>{question.text}</li>)}
              </ol>
            </> : <p className="text-[#797979]">Дополнительных вопросов нет</p>}
            <Button type="button" variant="link" disabled={isLoading || hasLoadError} onClick={() => setQuestionsOpen(true)} className="h-4 justify-start p-0 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#2563eb] no-underline hover:no-underline">{questions.length ? "Редактировать" : "Добавить"}</Button>
          </div>}

          <div className="flex flex-col gap-2">
            {availableChannels.length > 1 && <div className="flex flex-col gap-2">
              <p className="text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#797979]">Выберите канал</p>
              <Select value={selectedChannelId} onValueChange={setPreferredChannelId} disabled={channelsQuery.isLoading}>
                <SelectTrigger aria-label="Канал" className="h-10 w-full border-[#e4e4e4] bg-white px-3 text-[13px] font-medium text-black shadow-none">
                  <SelectValue placeholder="Выберите канал" />
                </SelectTrigger>
                <SelectContent>
                  {availableChannels.map((channel) => <SelectItem key={channel.id} value={channel.id}>
                    <span className="flex items-center gap-1"><ChannelAvatar avatarUrl={channel.avatarUrl} name={channel.name} />{channel.name ?? "Без названия"}</span>
                  </SelectItem>)}
                </SelectContent>
              </Select>
            </div>}

            <div className="flex flex-col gap-2">
              {mode === "direct" && <InvitationLinkField
                ariaLabel="Ссылка для добавления без модерации"
                url={preapprovedLink}
                isLoading={linksQuery.isLoading}
                helperText="Сначала отправьте эту ссылку, чтобы добавить пользователя в группу без модерации."
              />}
              <InvitationLinkField
                ariaLabel="Ссылка на канал"
                url={channelLink}
                isLoading={channelsQuery.isLoading}
                helperText={mode === "moderated"
                  ? "Скопируйте ссылку и отправьте пользователю, которого хотите пригласить в компанию. Ему откроется бот с дальнейшими инструкциями"
                  : "После вступления отправьте эту ссылку на канал. Пользователь пройдёт упрощённую регистрацию и сразу будет одобрен."}
              />
              {!isLoading && (hasLoadError || !channelLink || (mode === "direct" && !preapprovedLink)) && <p role="status" className="text-[12px] font-medium leading-4 text-destructive">
                {hasLoadError
                  ? "Не удалось загрузить данные для приглашения."
                  : !selectedChannelId
                    ? "Нет доступных каналов для регистрации."
                    : !channelLink
                      ? "У выбранного канала нет публичной ссылки."
                      : "Для выбранного канала нет доступной ссылки без модерации."}
              </p>}
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogRoot>
    {questionsOpen && <RegistrationQuestionsDialog open roomId={roomId} questions={questions} onClose={() => setQuestionsOpen(false)} />}
  </>;
}

export function AddParticipantDialog({ open, onClose, onSubmit, isPending, error }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: string, role: Exclude<TeamRole, "owner">) => void;
  isPending: boolean;
  error?: string;
}) {
  const [input, setInput] = useState("");
  const [role, setRole] = useState<Exclude<TeamRole, "owner">>("admin");
  return <DialogRoot open={open} onOpenChange={(next) => { if (!next && !isPending) onClose(); }}>
    <DialogContent data-participant-dialog showCloseButton={false} className={modalClass}>
      <form onSubmit={(event) => { event.preventDefault(); if (input.trim() && !isPending) onSubmit(input.trim(), role); }}>
        <ModalHeader title="Добавить пользователя" disabled={isPending} />
        <DialogDescription className="sr-only">Добавление пользователя в команду по ссылке на профиль VK</DialogDescription>
        <div className="flex flex-col gap-3 px-4 py-2">
          <div className="[&_[data-slot=field]]:gap-2 [&_label]:text-[13px] [&_label]:font-medium [&_label]:leading-4 [&_label]:text-[#797979]">
            <InputField label="Ссылка на профиль пользователя VK" aria-label="Ссылка на профиль пользователя VK" value={input} onChange={(event) => setInput(event.target.value)} disabled={isPending} className="h-10 rounded-md border-[#e4e4e4] bg-white px-3 text-[13px] font-medium shadow-none" />
          </div>
          <RadioGroup value={role} onValueChange={(value) => setRole(value as Exclude<TeamRole, "owner">)} disabled={isPending} aria-label="Роль участника" className="gap-2">
            {([['admin', 'Администратор'], ['editor', 'Редактор'], ['viewer', 'Наблюдатель']] as const).map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium leading-4"><RadioGroupItem value={value} className="size-4 border-[#e4e4e4] bg-[#f0f0f0] text-[#2563eb] data-[state=checked]:border-[#2563eb]" />{label}</label>)}
          </RadioGroup>
          {error && <p role="alert" className="text-[13px] leading-4 text-destructive">{error}</p>}
        </div>
        <DialogFooter className="flex-row justify-end px-4 py-2.5">
          <Button type="submit" disabled={isPending || !input.trim()} className={participantPrimaryClass}>{isPending ? "Добавление…" : "Добавить"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </DialogRoot>;
}

export function RemoveParticipantDialog({ open, onClose, onConfirm, isPending, error, description = "Подтвердите удаление пользователя" }: {
  open: boolean; onClose: () => void; onConfirm: () => void; isPending: boolean; error?: string; description?: string;
}) {
  return <DialogRoot open={open} onOpenChange={(next) => { if (!next && !isPending) onClose(); }}>
    <DialogContent data-participant-dialog showCloseButton={false} className={modalClass}>
      <ModalHeader title="Удалить пользователя" disabled={isPending} />
      <DialogDescription className="px-4 py-2 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#797979]">{description}</DialogDescription>
      {error && <p role="alert" className="px-4 text-[13px] text-destructive">{error}</p>}
      <DialogFooter className="flex-row justify-end gap-2 px-4 py-2.5">
        <Button variant="outline" className={participantSecondaryClass} disabled={isPending} onClick={onClose}>Отмена</Button>
        <Button className={`${participantButtonClass} bg-[red] text-white hover:bg-[red]/90`} disabled={isPending} onClick={onConfirm}>{isPending ? "Удаление…" : "Удалить"}</Button>
      </DialogFooter>
    </DialogContent>
  </DialogRoot>;
}
