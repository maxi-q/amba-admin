import { useState } from "react";
import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  CirclePause,
  Gift,
  Link2,
  Megaphone,
  Pencil,
  Sparkles,
  User,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import type { BaseCreativeTaskSubmissionDto } from "@/api/generated/model";
import { Avatar, Button } from "@senler/ui";
import { SubmissionStatusLogDialog } from "@/pages/(list_integration)/creativetasks/components/SubmissionStatusLogDialog";
import ambassadorAvatar from "@/pages/(list_integration)/creativetasks/assets/task-status-log/avatar.png";

const MOCK_SUBMISSION: BaseCreativeTaskSubmissionDto = {
  id: "690b5c27-1934-4b62-bc62-6ad3f68739f4",
  createdAt: "2026-12-12T09:53:00.000Z",
  updatedAt: "2026-12-12T13:53:00.000Z",
  taskId: "6f8e526d-92ac-49ce-9d4b-fddcf2a4c9fd",
  ambassadorId: "0f43f1f4-02d7-42bb-9843-50a3fd22516d",
  status: "waiting_for_review_publication",
  comment: "Публикация готова к проверке",
  reviewComment: null,
  rewardValue: 0,
  items: [
    {
      id: "efbdd552-1036-4636-b06d-2695e8d15476",
      texts: ["Как подключить каналы и запустить первую рассылку"],
      mediaFileIds: ["08b75c1f-7597-4e5b-b9ef-16b722d781d4"],
      targetUrls: ["https://senler.ru"],
      publicationUrl: "https://streamvi.io/",
      erid: "2Vtzqwexample",
    },
  ],
  events: [
    {
      id: "d4d5b036-8f46-4b63-a378-e68280e9e1bd",
      createdAt: "2026-12-12T09:53:00.000Z",
      type: "materials_submitted",
      actorType: "ambassador",
    },
    {
      id: "0adf6bf6-a04d-408b-94ce-34d192d0797c",
      createdAt: "2026-12-12T10:53:00.000Z",
      type: "materials_rejected",
      actorType: "project",
      payload: {
        reviewComment:
          "Неправильно показан порядок подключения каналов. Проверьте документацию",
      },
    },
    {
      id: "8b392dbf-43f8-4a3d-9898-4963390fa065",
      createdAt: "2026-12-12T11:53:00.000Z",
      type: "materials_updated",
      actorType: "ambassador",
    },
    {
      id: "99736ee2-4c62-4e5c-ac5b-e9907b7a536f",
      createdAt: "2026-12-12T12:53:00.000Z",
      type: "materials_approved",
      actorType: "project",
    },
    {
      id: "e57bcfc5-0d4f-4dde-a40d-c30460e6cfdf",
      createdAt: "2026-12-12T13:53:00.000Z",
      type: "publication_reported",
      actorType: "ambassador",
      payload: { publicationUrl: "https://streamvi.io/" },
    },
  ],
};

function getNextMockEventDate(submission: BaseCreativeTaskSubmissionDto) {
  const latestEventTime = Math.max(
    ...submission.events.map((event) => new Date(event.createdAt).getTime()),
  );
  return new Date(latestEventTime + 60_000).toISOString();
}

const NAV_ITEMS: {
  label: string;
  icon: typeof Sparkles;
  suffix?: string;
  active?: boolean;
}[] = [
  { label: "Токены", icon: Sparkles, suffix: "5 000" },
  { label: "Уведомления", icon: Bell, suffix: "1" },
  { label: "Спринт", icon: CalendarDays, suffix: "5", active: true },
  { label: "Индивидуальные задания", icon: Link2 },
  { label: "Награды", icon: Gift },
  { label: "Аналитика", icon: BarChart3 },
  { label: "Участники", icon: Users },
  { label: "Профиль ОРД", icon: UserCircle },
];

const ANSWERS = [
  { progress: 1, label: "Выполните работу" },
  { progress: 1, label: "Ожидайте публикацию..." },
  { progress: 2, label: "Проверьте публикацию" },
  { progress: 3, label: "Начислено 500 XP" },
] as const;

function AnswerProgress({ progress, label }: (typeof ANSWERS)[number]) {
  return (
    <div className="flex min-w-[150px] flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={`h-1 w-12 rounded-full ${step <= progress ? "bg-[#22c55e]" : "bg-[#e4e4e4]"}`}
          />
        ))}
      </div>
      <span className="truncate text-xs font-medium leading-4 text-[#797979]">{label}</span>
    </div>
  );
}

export function TaskStatusLogPreview() {
  const [submission, setSubmission] = useState(MOCK_SUBMISSION);
  const [logOpen, setLogOpen] = useState(true);

  return (
    <main className="min-h-dvh bg-white text-black">
      <header className="flex h-11 items-center justify-between border-b border-[#e4e4e4] px-4">
        <p className="text-[15px] font-medium leading-5">Амбассадор</p>
        <button type="button" aria-label="Закрыть стенд" className="text-[#797979]">
          <X className="size-5" />
        </button>
      </header>

      <div className="grid min-h-[calc(100dvh-44px)] grid-cols-[260px_minmax(480px,1fr)_260px]">
        <aside className="relative border-r border-[#e4e4e4] px-1 py-[6px]">
          <div className="flex h-8 items-center justify-between px-2 text-[13px] font-medium">
            <span className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-[8px] bg-[#18181b] text-white">
                <Megaphone className="size-3" />
              </span>
              StreamVi promo
              <ChevronDown className="size-3 text-[#797979]" />
            </span>
            <span className="flex items-center gap-1 text-[#797979]">
              <Users className="size-4" /> 0
            </span>
          </div>

          <nav aria-label="Навигация мок-стенда">
            {NAV_ITEMS.map(({ label, icon: Icon, suffix, active }) => (
              <div
                key={label}
                className={`flex h-8 items-center justify-between rounded-[8px] px-2 text-[13px] font-medium ${
                  active ? "bg-[#2563eb] text-white" : "text-black"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className={`size-5 ${active ? "text-white" : "text-[#797979]"}`} />
                  {label}
                </span>
                {suffix ? (
                  <span
                    className={
                      label === "Уведомления"
                        ? "rounded-[6px] bg-[#d52094] px-1.5 text-xs text-white"
                        : active
                          ? "rounded-[6px] bg-[#d52094] px-1.5 text-xs text-white"
                          : "text-[#797979]"
                    }
                  >
                    {suffix}
                  </span>
                ) : null}
              </div>
            ))}
          </nav>

          <div className="absolute inset-x-1 bottom-2 flex h-7 items-center justify-between rounded-[6px] border border-[#e4e4e4] px-2 text-[13px] font-medium">
            <span className="flex items-center gap-2">
              <Bot className="size-4 text-[#2563eb]" /> Создаём бота...
            </span>
            <CircleHelp className="size-4 text-[#797979]" />
          </div>
        </aside>

        <section className="min-w-0">
          <div className="flex h-[58px] items-center justify-between px-4">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7 shrink-0 rounded-[6px] border-[#e4e4e4] shadow-none"
                aria-label="Назад"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <h1 className="truncate text-xl font-medium leading-6">Снимите обзор на сервис</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7 rounded-[6px] border-[#e4e4e4] shadow-none"
                aria-label="Редактировать"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7 rounded-[6px] border-[#e4e4e4] shadow-none"
                aria-label="Приостановить"
              >
                <CirclePause className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex h-8 items-end gap-4 border-b border-[#e4e4e4] px-4 text-[13px] font-medium">
            <button type="button" className="h-8 border-b-2 border-[#2563eb] px-2">
              Ответы
            </button>
            <button type="button" className="h-8 px-2 text-[#797979]">
              Информация
            </button>
          </div>

          <div>
            {ANSWERS.map((answer, index) => (
              <button
                key={`${answer.label}-${index}`}
                type="button"
                onClick={() => setLogOpen(true)}
                className="flex h-12 w-full items-center gap-2 border-b border-[#e4e4e4] px-4 text-left hover:bg-[#f7f7f7]"
              >
                <Avatar
                  size="sm"
                  shape="rounded"
                  src={ambassadorAvatar}
                  alt="Алексей Попов"
                  name="Алексей Попов"
                  colorKey="Алексей Попов"
                />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                  Алексей Попов
                </span>
                <AnswerProgress {...answer} />
                <span className="flex size-7 items-center justify-center rounded-[6px] border border-[#e4e4e4] text-[#797979]">
                  <User className="size-4" />
                </span>
              </button>
            ))}
          </div>
        </section>

        <aside className="border-l border-[#e4e4e4] text-[13px] font-medium leading-4">
          <div className="border-b border-[#e4e4e4] p-4">
            <p>Вид задания</p>
            <p className="mt-1 text-[#797979]">Видео</p>
          </div>
          <div className="border-b border-[#e4e4e4] p-4">
            <p>Платформа</p>
            <p className="mt-1 flex items-center gap-1 text-[#797979]">
              <span className="flex h-3 w-[18px] items-center justify-center rounded-[3px] bg-[#ff0000] text-[8px] text-white">
                ▶
              </span>
              YouTube
            </p>
          </div>
          <div className="border-b border-[#e4e4e4] p-4">
            <p>Проверка задания</p>
            <p className="mt-1 text-[#797979]">До/после публикации</p>
          </div>
          <div className="border-b border-[#e4e4e4] p-4">
            <p>Очки</p>
            <p className="mt-1 flex items-center gap-1 text-[#797979]">
              <span className="text-[#a50064]">★</span> от 500 XP
            </p>
          </div>
        </aside>
      </div>

      <SubmissionStatusLogDialog
        open={logOpen}
        submission={submission}
        minimalRewardInBalls={500}
        onClose={() => setLogOpen(false)}
        onApprove={(_, rewardValue) => {
          setSubmission((current) => ({
            ...current,
            status: "approved",
            rewardValue: rewardValue ?? current.rewardValue,
            events: [
              ...current.events,
              {
                id: crypto.randomUUID(),
                createdAt: getNextMockEventDate(current),
                type: "publication_approved",
                actorType: "project",
                payload: { rewardValue: rewardValue ?? current.rewardValue },
              },
            ],
          }));
        }}
        onReject={(_, reviewComment) => {
          setSubmission((current) => ({
            ...current,
            status: "rejected_for_publication",
            reviewComment,
            events: [
              ...current.events,
              {
                id: crypto.randomUUID(),
                createdAt: getNextMockEventDate(current),
                type: "publication_rejected",
                actorType: "project",
                payload: { reviewComment },
              },
            ],
          }));
        }}
        isPending={false}
      />
    </main>
  );
}
