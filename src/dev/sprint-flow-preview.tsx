import { useEffect, useState, type ReactNode } from "react";
import { Avatar } from "@senler/ui";
import {
  BadgePercent,
  Banknote,
  Bell,
  Bot,
  Calendar,
  ChartPie,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronsUpDown,
  CircleAlert,
  CircleHelp,
  CirclePause,
  CirclePlay,
  CircleUserRound,
  Gift,
  Pencil,
  Plus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { BaseCreativeTaskSubmissionDto } from "@/api/generated/model";
import tokenIcon from "@/assets/sprint-flow/token.svg";
import rewardGift from "@/assets/sprint-flow/reward-gift.png";
import rewardMoney from "@/assets/sprint-flow/reward-money.png";
import taskMediaOne from "@/assets/sprint-flow/task-media-1.png";
import taskMediaTwo from "@/assets/sprint-flow/task-media-2.png";
import { IndividualTasksIcon } from "@/assets/icons/IndividualTasksIcon";
import ambassadorAvatar from "@/pages/(list_integration)/creativetasks/assets/task-status-log/avatar.png";
import { SubmissionStatusLogDialog } from "@/pages/(list_integration)/creativetasks/components/SubmissionStatusLogDialog";
import xpStar from "@/pages/(list_integration)/sprints/slug/assets/xp-star.svg";

type PreviewScreen =
  | "sprints"
  | "sprint-tasks"
  | "leaderboard"
  | "task-reports"
  | "task-information";

interface SprintPreviewItem {
  title: string;
  badge?: string;
  status: string;
  dot: string;
}

interface LeaderPreviewItem {
  name: string;
  money?: string;
  gift?: string;
  extra?: string;
  xp: string;
}

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
      targetUrls: ["https://streamvi.io"],
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

const SPRINTS: readonly SprintPreviewItem[] = [
  {
    title: "Лучший проморолик",
    badge: "5",
    status: "Активный",
    dot: "#22c55e",
  },
  {
    title: "Прогрев перед трансляцией",
    badge: "1",
    status: "Выдача наград",
    dot: "#22c55e",
  },
  {
    title: "Тестовый прогон",
    status: "Запланирован",
    dot: "#f79009",
  },
  {
    title: "Реферальная программа",
    status: "Черновик",
    dot: "#b8b8b8",
  },
  {
    title: "Прогрев перед трансляцией",
    status: "Завершен",
    dot: "#b8b8b8",
  },
];

const TASKS = [
  { title: "Снимите обзор на сервис", state: "answers", label: "3 ответа" },
  {
    title: "Сделайте пост о своем опыте со StreamVi",
    state: "paused",
    label: "2 ответа",
  },
  { title: "Снимите обзор на сервис", state: "reviewed", label: "Все проверено" },
  { title: "Снимите обзор на сервис", state: "empty", label: "Ответов нет" },
] as const;

const REPORTS = [
  { progress: 1, label: "Проверьте работу", muted: false },
  { progress: 1, label: "Публикация...", muted: true },
  { progress: 2, label: "Проверьте публикацию", muted: false },
  { progress: 2, label: "Проверьте публикацию", muted: false },
  { progress: 3, label: "Начислено 500 XP", muted: true },
] as const;

const LEADERS: readonly LeaderPreviewItem[] = [
  { name: "Алексей Попов", money: "5 000 ₽", gift: "Футболка 1", extra: "+2", xp: "13 720 XP" },
  { name: "Сергей Морозов", money: "2 345 ₽", gift: "Футболка 1", xp: "2 678 XP" },
  { name: "Анастасия Бунова", money: "1 121 ₽", xp: "1 325 XP" },
  { name: "Юлия Манова", money: "614 ₽", xp: "720 XP" },
  { name: "Степан Морозов", xp: "567 XP" },
];

function getNextMockEventDate(submission: BaseCreativeTaskSubmissionDto) {
  const latestEventTime = Math.max(
    ...submission.events.map((event) => new Date(event.createdAt).getTime()),
  );
  return new Date(latestEventTime + 60_000).toISOString();
}

function IconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-7 shrink-0 items-center justify-center rounded-[6px] border border-[#e4e4e4] bg-white text-[#707070] hover:bg-[#f7f7f7]"
    >
      {children}
    </button>
  );
}

function PinkBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex min-w-4 items-center justify-center rounded-[6px] bg-[#d52094] px-1.5 text-xs font-medium leading-4 text-white">
      {children}
    </span>
  );
}

function CompanyLogo() {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-[8px] border border-[#e4e4e4] bg-[#141414]">
      <BadgePercent className="size-4 text-[#8b5cf6]" strokeWidth={1.5} />
    </span>
  );
}

function PreviewSidebar({ onSprint }: { onSprint: () => void }) {
  const navItems: { label: string; icon: ReactNode; suffix?: ReactNode; sprint?: boolean }[] = [
    {
      label: "Токены",
      icon: <img src={tokenIcon} alt="" className="size-5" />,
      suffix: <span className="text-[#797979]">5 000</span>,
    },
    {
      label: "Уведомления",
      icon: <Bell className="size-5 text-[#707070]" strokeWidth={1.5} />,
      suffix: <PinkBadge>1</PinkBadge>,
    },
    {
      label: "Спринт",
      icon: <Calendar className="size-5" strokeWidth={1.5} />,
      suffix: <PinkBadge>5</PinkBadge>,
      sprint: true,
    },
    {
      label: "Индивидуальные задания",
      icon: <IndividualTasksIcon className="size-5 text-[#707070]" />,
    },
    {
      label: "Награды",
      icon: <Gift className="size-5 text-[#707070]" strokeWidth={1.5} />,
    },
    {
      label: "Аналитика",
      icon: <ChartPie className="size-5 text-[#707070]" strokeWidth={1.5} />,
    },
    {
      label: "Участники",
      icon: <Users className="size-5 text-[#707070]" strokeWidth={1.5} />,
    },
    {
      label: "Профиль ОРД",
      icon: <CircleUserRound className="size-5 text-[#707070]" strokeWidth={1.5} />,
    },
  ];

  return (
    <aside className="relative flex min-h-0 flex-col border-r border-[#e4e4e4] bg-white text-[13px] font-medium leading-4 tracking-[-0.25px]">
      <div className="min-h-0 flex-1 overflow-hidden border-r border-[#e4e4e4] pl-1 pr-2 pt-1.5">
        <div className="flex h-8 items-center justify-between rounded-[8px] pl-1.5 pr-2">
          <span className="flex items-center gap-[7px]">
            <CompanyLogo />
            <span className="flex items-center gap-0.5">
              StreamVi promo
              <ChevronsUpDown className="size-3 text-[#707070]" strokeWidth={1.5} />
            </span>
          </span>
          <span className="flex items-center gap-1 text-[#797979]">
            <Users className="size-4" strokeWidth={1.5} /> 0
          </span>
        </div>

        <nav aria-label="Навигация стенда">
          {navItems.map((item) => {
            const content = (
              <>
                <span className="flex min-w-0 items-center gap-[9px]">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </span>
                {item.suffix}
              </>
            );

            return item.sprint ? (
              <button
                key={item.label}
                type="button"
                onClick={onSprint}
                className="flex h-8 w-full items-center justify-between rounded-[8px] bg-[#2563eb] px-2 text-left text-white"
              >
                {content}
              </button>
            ) : (
              <div
                key={item.label}
                className="flex h-8 items-center justify-between rounded-[8px] px-2 text-black"
              >
                {content}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="w-full p-1">
        <div className="flex h-8 items-center gap-[9px] rounded-[8px] border border-[#e4e4e4] px-2">
          <Bot className="size-5 shrink-0 text-[#2563eb]" strokeWidth={1.5} />
          <span className="min-w-0 flex-1 truncate">Создаем бота...</span>
          <CircleHelp className="size-4 shrink-0 text-[#707070]" strokeWidth={1.5} />
        </div>
      </div>
    </aside>
  );
}

function SprintsScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="col-span-2 min-w-0 overflow-y-auto">
      <div className="flex h-12 items-center justify-between border-b border-[#e4e4e4] px-4 text-[13px] font-medium leading-4">
        <h1>Спринт</h1>
        <button
          type="button"
          className="flex h-7 items-center gap-1 rounded-[6px] bg-[#2563eb] px-2 text-white"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          Добавить
        </button>
      </div>

      {SPRINTS.map((sprint) => (
        <div
          key={`${sprint.title}-${sprint.status}`}
          className="flex h-12 items-center gap-4 border-b border-[#e4e4e4] px-4 text-[13px] font-medium leading-4"
        >
          <button
            type="button"
            onClick={onOpen}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <span className="truncate">{sprint.title}</span>
            {sprint.badge ? <PinkBadge>{sprint.badge}</PinkBadge> : null}
          </button>
          <span className="flex h-6 shrink-0 items-center gap-1 rounded-full border border-[#e4e4e4] px-2">
            <span
              className="size-2 rounded-full border"
              style={{ borderColor: sprint.dot }}
            />
            {sprint.status}
          </span>
          <span className="w-[147px] shrink-0 text-[#797979]">
            12.12.2026&nbsp;–&nbsp;12.12.2026
          </span>
          <IconButton label={`Редактировать ${sprint.title}`}>
            <Pencil className="size-4" strokeWidth={1.5} />
          </IconButton>
        </div>
      ))}
    </section>
  );
}

function SegmentedTabs({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex h-7 w-fit rounded-[6px] bg-[#f0f0f0] p-0.5 text-[13px] font-medium leading-4">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-[5px] px-1.5 outline-none focus:outline-none focus:ring-0 ${
            option.value === value
              ? "border border-[#e4e4e4] bg-white"
              : "border border-transparent"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SprintHeader({
  tab,
  onTab,
}: {
  tab: "tasks" | "leaderboard";
  onTab: (tab: "tasks" | "leaderboard") => void;
}) {
  return (
    <>
      <div className="flex h-[60px] items-center justify-between px-4">
        <h1 className="truncate text-xl font-medium leading-8 tracking-[-0.4px]">
          Прогрев перед трансляцией
        </h1>
        <IconButton label="Редактировать спринт">
          <Pencil className="size-4" strokeWidth={1.5} />
        </IconButton>
      </div>
      <div className="h-7 px-4">
        <SegmentedTabs
          value={tab}
          options={[
            { value: "tasks", label: "Задания" },
            { value: "leaderboard", label: "Таблица лидеров" },
          ]}
          onChange={(next) => onTab(next as "tasks" | "leaderboard")}
        />
      </div>
    </>
  );
}

function SprintTasks({ onTask }: { onTask: () => void }) {
  return (
    <div>
      {TASKS.map((task, index) => (
        <div
          key={`${task.title}-${index}`}
          className="flex h-12 items-center gap-2 border-b border-[#e4e4e4] px-4 text-[13px] font-medium leading-4"
        >
          <button
            type="button"
            onClick={onTask}
            className="flex min-w-0 flex-1 items-center gap-1 text-left"
          >
            <span className="truncate">{task.title}</span>
            {task.state === "paused" ? (
              <span className="shrink-0 text-[#797979]">На паузе</span>
            ) : null}
          </button>

          {task.state === "answers" || task.state === "paused" ? (
            <span className="rounded-[8px] bg-[#ffe0f5] px-2 py-1 text-[#d52094]">
              {task.label}
            </span>
          ) : task.state === "reviewed" ? (
            <span className="flex items-center gap-1 rounded-[8px] bg-[#f0f0f0] px-2 py-1">
              <Check className="size-4 text-[#55a32a]" strokeWidth={1.5} />
              {task.label}
            </span>
          ) : (
            <span className="rounded-[8px] bg-[#f0f0f0] px-2 py-1 text-[#797979]">
              {task.label}
            </span>
          )}

          <IconButton label={task.state === "paused" ? "Продолжить" : "Приостановить"}>
            {task.state === "paused" ? (
              <CirclePlay className="size-4" strokeWidth={1.5} />
            ) : (
              <CirclePause className="size-4" strokeWidth={1.5} />
            )}
          </IconButton>
        </div>
      ))}
    </div>
  );
}

function MoneyPill({
  children,
  showChevron,
}: {
  children: ReactNode;
  showChevron: boolean;
}) {
  return (
    <span className="flex h-6 items-center gap-0.5 rounded-full bg-[#f0f0f0] px-1.5 text-[13px] leading-4">
      <Banknote className="size-3.5 text-[#22c55e]" strokeWidth={1.5} />
      {children}
      {showChevron ? (
        <ChevronDown className="size-3 text-[#797979]" strokeWidth={1.5} />
      ) : null}
    </span>
  );
}

function Leaderboard() {
  return (
    <div>
      {LEADERS.map((leader, index) => (
        <div key={leader.name}>
          {index === 4 ? (
            <div className="flex h-6 items-center justify-center border-b border-[#e4e4e4] text-xs font-medium leading-4 text-[#797979]">
              Конец зоны вознаграждений
            </div>
          ) : null}
          <div className="flex h-12 items-center gap-2 border-b border-[#e4e4e4] px-4 text-[13px] font-medium leading-4">
            <span className="w-3 shrink-0">{index + 1}.</span>
            <Avatar
              size="sm"
              shape="rounded"
              src={ambassadorAvatar}
              alt={leader.name}
              name={leader.name}
              colorKey={leader.name}
            />
            <span className="min-w-0 flex-1 truncate">{leader.name}</span>
            {leader.money ? (
              <MoneyPill showChevron={index > 0}>{leader.money}</MoneyPill>
            ) : null}
            {leader.gift ? (
              <span className="flex h-6 items-center gap-0.5 rounded-full bg-[#f0f0f0] px-1.5">
                <Gift className="size-3.5 text-[#d52094]" strokeWidth={1.5} />
                {leader.gift}
              </span>
            ) : null}
            {leader.extra ? (
              <span className="flex size-6 items-center justify-center rounded-full bg-[#e7efff] text-[#2563eb]">
                {leader.extra}
              </span>
            ) : null}
            <span className="flex shrink-0 items-center gap-1">
              <img src={xpStar} alt="" className="size-4" />
              {leader.xp}
            </span>
            <IconButton label={`Открыть профиль ${leader.name}`}>
              <UserRound className="size-4" strokeWidth={1.5} />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  );
}

function RewardRow({
  image,
  title,
  count,
}: {
  image: string;
  title: string;
  count?: string;
}) {
  return (
    <div className="flex min-h-12 items-center gap-2">
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[#f0f0f0]">
        <img src={image} alt="" className="size-10 object-contain" />
      </span>
      <span className="min-w-0 leading-4">
        <span className="block truncate text-[13px] font-medium">{title}</span>
        {count ? <span className="block text-[13px] text-[#797979]">{count}</span> : null}
      </span>
    </div>
  );
}

function SprintRightRail() {
  return (
    <aside className="min-h-0 overflow-y-auto border-l border-[#e4e4e4] bg-white text-[13px] font-medium leading-4">
      <section className="border-b border-[#e4e4e4] p-4">
        <h2>О спринте</h2>
        <p className="mt-1 font-normal text-[#797979]">
          Выполняйте задания спринта и зарабатывайте очки. Чем больше очков, тем больше шанс выиграть супер-приз
        </p>
      </section>
      <section className="border-b border-[#e4e4e4] p-4">
        <p>
          Статус <span className="text-[#22c55e]">Активный</span>
        </p>
        <p className="mt-1 flex items-center gap-1 text-[#797979]">
          <Calendar className="size-4" strokeWidth={1.5} />
          6 апр, 12:00&nbsp;–&nbsp;27 сен, 12:00
        </p>
      </section>
      <section className="p-4 pb-2">
        <h2>Награды рейтинга</h2>
        <p className="mt-1 text-[#797979]">Распределяются по количеству XP</p>
        <div className="mt-2 grid gap-2">
          <RewardRow image={rewardMoney} title="5 000 ₽" />
          <RewardRow image={rewardGift} title="Футболка" count="1 шт." />
          <RewardRow image={rewardGift} title="Тариф Pro" count="3 шт." />
        </div>
      </section>
      <section className="px-4 pb-4 pt-1">
        <h2>Ручной отбор</h2>
        <p className="mt-1 text-[#797979]">Распределяются вручную</p>
        <div className="mt-2 grid gap-2">
          <RewardRow image={rewardMoney} title="5 000 ₽" />
          <RewardRow image={rewardGift} title="Футболка" count="1 шт." />
          <RewardRow image={rewardGift} title="Тариф Pro" count="3 шт." />
        </div>
      </section>
    </aside>
  );
}

function SprintScreen({
  tab,
  onTab,
  onTask,
}: {
  tab: "tasks" | "leaderboard";
  onTab: (tab: "tasks" | "leaderboard") => void;
  onTask: () => void;
}) {
  return (
    <>
      <section className="min-w-0 overflow-y-auto">
        <SprintHeader tab={tab} onTab={onTab} />
        {tab === "tasks" ? <SprintTasks onTask={onTask} /> : <Leaderboard />}
      </section>
      <SprintRightRail />
    </>
  );
}

function TaskHeader({
  tab,
  onBack,
  onTab,
}: {
  tab: "reports" | "information";
  onBack: () => void;
  onTab: (tab: "reports" | "information") => void;
}) {
  return (
    <>
      <div className="flex h-[60px] items-center gap-3 px-4">
        <IconButton label="Назад к спринту" onClick={onBack}>
          <ChevronLeft className="size-4" strokeWidth={1.5} />
        </IconButton>
        <h1 className="min-w-0 flex-1 truncate text-xl font-medium leading-8 tracking-[-0.4px]">
          Снимите обзор на сервис
        </h1>
        <IconButton label="Редактировать задание">
          <Pencil className="size-4" strokeWidth={1.5} />
        </IconButton>
        <IconButton label="Приостановить задание">
          <CirclePause className="size-4" strokeWidth={1.5} />
        </IconButton>
      </div>
      <div className="h-7 px-4">
        <SegmentedTabs
          value={tab}
          options={[
            { value: "reports", label: "Отчеты" },
            { value: "information", label: "Информация" },
          ]}
          onChange={(next) => onTab(next as "reports" | "information")}
        />
      </div>
    </>
  );
}

function ReportProgress({
  progress,
  label,
  muted,
}: (typeof REPORTS)[number]) {
  return (
    <div className="flex w-[149px] shrink-0 flex-col gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={`h-1 flex-1 rounded-full ${
              step <= progress ? "bg-[#26c464]" : "bg-[#e4e4e4]"
            }`}
          />
        ))}
      </div>
      <span
        className={`truncate text-xs font-medium leading-4 ${
          muted ? "text-[#797979]" : "text-black"
        }`}
      >
        {!muted ? <span className="mr-1 inline-block size-1 rounded-full bg-[#26c464] align-middle" /> : null}
        {label}
      </span>
    </div>
  );
}

function TaskReports({ onOpenLog }: { onOpenLog: () => void }) {
  return (
    <div>
      {REPORTS.map((report, index) => (
        <button
          key={`${report.label}-${index}`}
          type="button"
          onClick={onOpenLog}
          className="flex h-12 w-full items-center gap-2 border-b border-[#e4e4e4] px-4 text-left text-[13px] font-medium leading-4 hover:bg-[#f7f7f7]"
        >
          <Avatar
            size="sm"
            shape="rounded"
            src={ambassadorAvatar}
            alt="Алексей Попов"
            name="Алексей Попов"
            colorKey="Алексей Попов"
          />
          <span className="min-w-0 flex-1 truncate">Алексей Попов</span>
          <ReportProgress {...report} />
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px] border border-[#e4e4e4] bg-white text-[#707070]">
            <UserRound className="size-4" strokeWidth={1.5} />
          </span>
        </button>
      ))}
    </div>
  );
}

function InfoCard({
  title,
  children,
  danger = false,
}: {
  title: ReactNode;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={`rounded-[12px] ${
        danger
          ? "bg-[#ffebeb] p-4"
          : "border border-[#e4e4e4] bg-white p-[15px]"
      }`}
    >
      <h2 className="text-[15px] font-medium leading-5 tracking-[-0.15px]">{title}</h2>
      <div className="mt-1 text-[13px] font-medium leading-4 tracking-[-0.25px]">{children}</div>
    </section>
  );
}

function TaskInformation() {
  return (
    <div className="grid gap-2 px-4 pb-4 pt-3">
      <InfoCard title="Информация о продукте/услуге">
        StreamVi - сервис рестрима, поддерживающий 26+ платформ. Сервис поддерживает транскодинг, настройку битрейта и вебинары
      </InfoCard>
      <InfoCard title="Что нужно сделать">
        Снимите обзор на сервис StreamVi. Покажите, как подключить сервис с стриминг-сервису и запустить трансляцию. Расскажите про подключение каналов к сервису. В описании укажите один из вариантов текста, которые мы прикрепили ниже и ссылку для перехода в сервис
      </InfoCard>
      <InfoCard
        danger
        title={
          <span className="flex items-center gap-1.5">
            <CircleAlert className="size-4 text-[#ff0000]" strokeWidth={1.5} />
            Что запрещено
          </span>
        }
      >
        Нельзя негативно отзываться о конкурентах, также говорить о запрещенных соц-сетях (Instagram, Facebook), хотя они доступны у нас к выбору платформ для рестрима
      </InfoCard>
      <InfoCard title="Медиаматериалы">
        <div className="mt-3 grid gap-2 text-[#797979]">
          <div>
            <p>Целевая ссылка</p>
            <p className="mt-1 flex gap-2 text-black">
              <span className="w-4 text-right text-[#797979]">1.</span>
              <a href="https://streamvi.io/" className="text-[#2563eb]" target="_blank" rel="noreferrer">
                https://streamvi.io/
              </a>
            </p>
          </div>
          <div>
            <p>Файлы</p>
            <div className="mt-2 flex gap-2">
              <img src={taskMediaOne} alt="Горный пейзаж" className="size-[75px] rounded-[6px] object-cover" />
              <img src={taskMediaTwo} alt="Черно-белый горный пейзаж" className="size-[75px] rounded-[6px] object-cover grayscale" />
            </div>
          </div>
          <div>
            <p>Текст</p>
            <ol className="mt-2 grid list-decimal gap-2 pl-6 text-black">
              <li>Ведите трансляцию сразу на несколько платформ уже сейчас с помощью StreamVi. Первые 30 дней бесплатно</li>
              <li>Ведите трансляцию на YouTube, Twitch и VK одновременно с помощью StreamVi. Первые 30 дней бесплатно</li>
            </ol>
          </div>
        </div>
      </InfoCard>
      <InfoCard title="Критерии оценки">
        <ol className="list-decimal pl-5">
          <li>Видео должно быть качественным</li>
          <li>Продолжительность видео 10 минут</li>
          <li>В видео должно быть видно ваше лицо</li>
          <li>В видео должен быть наш логотип</li>
        </ol>
      </InfoCard>
    </div>
  );
}

function YoutubeMark() {
  return (
    <span className="flex items-center gap-1">
      <span className="flex h-3 w-[18px] items-center justify-center rounded-[3px] bg-[#ff0000] text-[8px] leading-none text-white">
        ▶
      </span>
      YouTube
    </span>
  );
}

function TaskRightRail() {
  const items: { title: string; value: ReactNode }[] = [
    { title: "Вид задания", value: "Видео" },
    { title: "Платформа", value: <YoutubeMark /> },
    { title: "Проверка задания", value: "До/после публикации" },
    {
      title: "Очки",
      value: (
        <span className="flex items-center gap-1 text-black">
          <img src={xpStar} alt="" className="size-4" /> от 500 XP
        </span>
      ),
    },
  ];

  return (
    <aside className="border-l border-[#e4e4e4] bg-white text-[13px] font-medium leading-4">
      {items.map((item) => (
        <section key={item.title} className="min-h-[68px] border-b border-[#e4e4e4] p-4">
          <h2>{item.title}</h2>
          <div className="mt-1 text-[#797979]">{item.value}</div>
        </section>
      ))}
    </aside>
  );
}

function TaskScreen({
  tab,
  onTab,
  onBack,
  onOpenLog,
}: {
  tab: "reports" | "information";
  onTab: (tab: "reports" | "information") => void;
  onBack: () => void;
  onOpenLog: () => void;
}) {
  return (
    <>
      <section className="min-w-0 overflow-y-auto">
        <TaskHeader tab={tab} onBack={onBack} onTab={onTab} />
        {tab === "reports" ? (
          <TaskReports onOpenLog={onOpenLog} />
        ) : (
          <TaskInformation />
        )}
      </section>
      <TaskRightRail />
    </>
  );
}

export function SprintFlowPreview() {
  const [screen, setScreen] = useState<PreviewScreen>("sprints");
  const [submission, setSubmission] = useState(MOCK_SUBMISSION);
  const [logOpen, setLogOpen] = useState(false);
  const [previewScale, setPreviewScale] = useState(() =>
    Math.min(window.innerWidth / 1200, 1),
  );

  useEffect(() => {
    const updatePreviewScale = () => {
      setPreviewScale(Math.min(window.innerWidth / 1200, 1));
    };
    window.addEventListener("resize", updatePreviewScale);
    return () => window.removeEventListener("resize", updatePreviewScale);
  }, []);

  const isSprint = screen === "sprint-tasks" || screen === "leaderboard";
  const isTask = screen === "task-reports" || screen === "task-information";

  return (
    <div
      className="overflow-hidden bg-white"
      style={{
        width: 1200 * previewScale,
        height: Math.max(window.innerHeight, 756) * previewScale,
      }}
    >
    <main
      data-sprint-flow-preview
      className="min-h-dvh w-[1200px] bg-white text-black"
      style={{
        transform: `scale(${previewScale})`,
        transformOrigin: "left top",
      }}
    >
      <header className="flex h-11 items-center justify-between border-b border-[#e4e4e4] px-4">
        <p className="text-[15px] font-medium leading-5">Амбассадор</p>
        <button
          type="button"
          aria-label="Вернуться к списку спринтов"
          onClick={() => setScreen("sprints")}
          className="text-[#797979]"
        >
          <X className="size-5" strokeWidth={1.5} />
        </button>
      </header>

      <div className="grid h-[calc(100dvh-44px)] min-h-[712px] grid-cols-[260px_minmax(680px,1fr)_260px]">
        <PreviewSidebar onSprint={() => setScreen("sprints")} />
        {screen === "sprints" ? <SprintsScreen onOpen={() => setScreen("sprint-tasks")} /> : null}
        {isSprint ? (
          <SprintScreen
            tab={screen === "leaderboard" ? "leaderboard" : "tasks"}
            onTab={(tab) => setScreen(tab === "leaderboard" ? "leaderboard" : "sprint-tasks")}
            onTask={() => setScreen("task-reports")}
          />
        ) : null}
        {isTask ? (
          <TaskScreen
            tab={screen === "task-information" ? "information" : "reports"}
            onTab={(tab) => setScreen(tab === "information" ? "task-information" : "task-reports")}
            onBack={() => setScreen("sprint-tasks")}
            onOpenLog={() => setLogOpen(true)}
          />
        ) : null}
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
    </div>
  );
}
