import type { AxiosRequestConfig } from "axios";
import type {
  BaseAmbassadorDto,
  BaseCreativeTaskSubmissionDto,
  BaseRoomDto,
  BaseSprintDto,
  CreativeTaskWithDefaultsDto,
  GetLeaderboardResponseDto,
  GetProjectResponseDto,
  SprintRewardRuleDto,
  UpdateSubmissionStatusRequestDto,
} from "@/api/generated/model";
import { setCustomInstanceMock } from "@/api/mutator/custom-instance";
import { useAuthStore } from "@/store";
import rewardGiftUrl from "@/assets/sprint-flow/reward-gift.png";
import rewardMoneyUrl from "@/assets/sprint-flow/reward-money.png";

const ROOM_ID = "preview-room";
const SPRINT_ID = "sprint-active";
const TASK_ID = "task-review";
const NOW = "2026-08-21T09:00:00.000Z";

const room: BaseRoomDto = {
  id: ROOM_ID,
  createdAt: NOW,
  updatedAt: NOW,
  name: "StreamVi promo",
  pendingSubscriptionId: 101,
  approvedSubscriptionId: 102,
  rejectedSubscriptionId: 103,
  notificationCreativeTaskApprovedBotId: null,
  notificationCreativeTaskRejectedBotId: null,
  webhookUrl: null,
  secretKey: "preview",
  isDeleted: false,
  projectId: "preview-project",
};

const project: GetProjectResponseDto = {
  id: "preview-project",
  createdAt: NOW,
  updatedAt: NOW,
  name: "Амбассадор",
  channelTypeId: 1,
  channelExternalId: "preview",
  avatarUrl: "",
};

const sprint = (
  id: string,
  name: string,
  startDate: string,
  endDate: string | null,
  status: BaseSprintDto["status"] = "active",
  ignoreEndDate = false,
): BaseSprintDto => ({
  id,
  createdAt: NOW,
  updatedAt: NOW,
  name,
  description:
    "Выполняйте задания спринта и зарабатывайте очки. Чем больше очков, тем больше шанс выиграть супер-приз",
  startDate,
  endDate,
  ignoreEndDate,
  status,
  pendingSubscriptionId: 201,
  approvedSubscriptionId: 202,
  rejectedSubscriptionId: 203,
  rewardType: "fix",
  rewardUnits: "XP",
  rewardValue: 500,
  promoCodeUsagesCount: 0,
  promoCodeUsageLimit: 100,
  ignorePromoCodeUsageLimit: false,
  roomId: ROOM_ID,
});

const sprints: BaseSprintDto[] = [
  sprint(
    SPRINT_ID,
    "Прогрев перед трансляцией",
    "2026-04-06T09:00:00.000Z",
    "2026-09-27T09:00:00.000Z",
  ),
  sprint(
    "sprint-awarding",
    "Лучший проморолик",
    "2026-01-10T09:00:00.000Z",
    "2026-08-01T09:00:00.000Z",
    "awarding",
  ),
  sprint(
    "sprint-planned",
    "Тестовый прогон",
    "2026-10-01T09:00:00.000Z",
    "2026-12-01T09:00:00.000Z",
  ),
  sprint(
    "sprint-completed",
    "Реферальная программа",
    "2025-08-01T09:00:00.000Z",
    "2025-10-01T09:00:00.000Z",
    "completed",
  ),
  sprint(
    "sprint-endless",
    "Постоянная программа",
    "2026-03-01T09:00:00.000Z",
    null,
    "active",
    true,
  ),
];

const task = (
  id: string,
  title: string,
  description: string,
): CreativeTaskWithDefaultsDto => ({
  id,
  createdAt: NOW,
  updatedAt: NOW,
  title,
  description,
  isDeleted: false,
  criteria: [
    "Покажите подключение канала",
    "Расскажите о первом запуске рассылки",
  ],
  restrictions: [
    "Не используйте чужие материалы без разрешения",
    "Не скрывайте рекламный характер публикации",
  ],
  allowedFormats: ["VIDEO"],
  targetPlatform: "YOUTUBE_CHANNEL",
  minimalRewardInBalls: 500,
  roomId: ROOM_ID,
  sprintId: SPRINT_ID,
  allowAmbassadorMedia: true,
  allowAmbassadorText: true,
  allowAmbassadorTargetUrl: true,
  publicationsCount: 1,
  requireMaterialsReview: true,
  requirePublicationReview: true,
  defaultMediaIds: ["task-media-1", "task-media-2"],
  defaultTexts: ["Как подключить каналы и запустить первую рассылку"],
  defaultTargetUrls: ["https://streamvi.io"],
  ordProductDescription:
    "StreamVi помогает запускать трансляции и работать с аудиторией в одном месте.",
});

const tasks: CreativeTaskWithDefaultsDto[] = [
  task(TASK_ID, "Снимите обзор на сервис", "Снимите короткий обзор StreamVi и покажите основной сценарий работы."),
  task("task-publication", "Сделайте пост о своем опыте со StreamVi", "Поделитесь личным опытом использования сервиса."),
  task("task-reviewed", "Расскажите о первой трансляции", "Опишите подготовку и результат первой трансляции."),
  task("task-empty", "Покажите любимую функцию", "Продемонстрируйте функцию, которой пользуетесь чаще всего."),
];

const ambassadors: BaseAmbassadorDto[] = [
  "Алексей Попов",
  "Сергей Морозов",
  "Анастасия Бунова",
  "Юлия Манова",
  "Степан Морозов",
].map((username, index) => ({
  id: `ambassador-${index + 1}`,
  createdAt: NOW,
  updatedAt: NOW,
  username,
  promoCode: `STREAM${index + 1}`,
  channelTypeId: 1,
  subscriberId: `subscriber-${index + 1}`,
}));

const submissionItem = {
  id: "submission-item",
  texts: ["Как подключить каналы и запустить первую рассылку"],
  mediaFileIds: ["task-media-1"],
  targetUrls: ["https://streamvi.io"],
  publicationUrl: "https://streamvi.io/",
  erid: "2Vtzqwexample",
};

const submission = (
  id: string,
  taskId: string,
  ambassadorId: string,
  status: BaseCreativeTaskSubmissionDto["status"],
  rewardValue = 0,
  events: BaseCreativeTaskSubmissionDto["events"] = [],
): BaseCreativeTaskSubmissionDto => ({
  id,
  createdAt: "2026-12-12T09:53:00.000Z",
  updatedAt: "2026-12-12T13:53:00.000Z",
  taskId,
  ambassadorId,
  status,
  comment: "Публикация готова к проверке",
  reviewComment: null,
  rewardValue,
  items: [{ ...submissionItem, id: `${id}-item` }],
  events,
});

let submissions: BaseCreativeTaskSubmissionDto[] = [
  submission(
    "submission-materials",
    TASK_ID,
    "ambassador-1",
    "waiting_for_review_materials",
    0,
    [
      {
        id: "event-materials-submitted",
        createdAt: "2026-12-12T09:53:00.000Z",
        type: "materials_submitted",
        actorType: "ambassador",
      },
    ],
  ),
  submission(
    "submission-publication",
    TASK_ID,
    "ambassador-2",
    "waiting_for_publication",
  ),
  submission(
    "submission-review",
    TASK_ID,
    "ambassador-3",
    "waiting_for_review_publication",
    0,
    [
      {
        id: "event-submitted",
        createdAt: "2026-12-12T09:53:00.000Z",
        type: "materials_submitted",
        actorType: "ambassador",
      },
      {
        id: "event-rejected",
        createdAt: "2026-12-12T10:53:00.000Z",
        type: "materials_rejected",
        actorType: "project",
        payload: {
          reviewComment:
            "Неправильно показан порядок подключения каналов. Проверьте документацию",
        },
      },
      {
        id: "event-updated",
        createdAt: "2026-12-12T11:53:00.000Z",
        type: "materials_updated",
        actorType: "ambassador",
      },
      {
        id: "event-approved",
        createdAt: "2026-12-12T12:53:00.000Z",
        type: "materials_approved",
        actorType: "project",
      },
      {
        id: "event-publication",
        createdAt: "2026-12-12T13:53:00.000Z",
        type: "publication_reported",
        actorType: "ambassador",
        payload: { publicationUrl: "https://streamvi.io/" },
      },
    ],
  ),
  submission(
    "submission-review-2",
    TASK_ID,
    "ambassador-4",
    "waiting_for_review_publication",
  ),
  submission("submission-approved", TASK_ID, "ambassador-5", "approved", 500),
  submission(
    "submission-task-2-a",
    "task-publication",
    "ambassador-1",
    "waiting_for_review_materials",
  ),
  submission(
    "submission-task-2-b",
    "task-publication",
    "ambassador-2",
    "waiting_for_publication",
  ),
  submission("submission-reviewed-a", "task-reviewed", "ambassador-1", "approved", 500),
  submission("submission-reviewed-b", "task-reviewed", "ambassador-2", "approved", 500),
];

const rewards = {
  money: { id: "reward-money", name: "5 000 ₽", iconUrl: rewardMoneyUrl },
  shirt: { id: "reward-shirt", name: "Футболка", iconUrl: rewardGiftUrl },
  pro: { id: "reward-pro", name: "Тариф Pro", iconUrl: rewardGiftUrl },
  points: { id: "reward-points", name: "Баллы Senler", iconUrl: rewardGiftUrl },
};

const rewardRules: SprintRewardRuleDto[] = [
  {
    id: "rule-rating",
    createdAt: NOW,
    updatedAt: NOW,
    sprintId: SPRINT_ID,
    type: "byRank",
    rankFrom: 1,
    rankTo: 4,
    minPoints: null,
    rewards: [
      { id: "rule-money", rewardId: rewards.money.id, amount: 1, reward: rewards.money },
      { id: "rule-shirt", rewardId: rewards.shirt.id, amount: 1, reward: rewards.shirt },
      { id: "rule-pro", rewardId: rewards.pro.id, amount: 3, reward: rewards.pro },
      { id: "rule-points", rewardId: rewards.points.id, amount: 1000, reward: rewards.points },
    ],
  },
  {
    id: "rule-manual",
    createdAt: NOW,
    updatedAt: NOW,
    sprintId: SPRINT_ID,
    type: "manual",
    rankFrom: null,
    rankTo: null,
    minPoints: null,
    rewards: [
      { id: "manual-money", rewardId: rewards.money.id, amount: 1, reward: rewards.money },
      { id: "manual-shirt", rewardId: rewards.shirt.id, amount: 1, reward: rewards.shirt },
      { id: "manual-pro", rewardId: rewards.pro.id, amount: 3, reward: rewards.pro },
    ],
  },
];

const leaderboard: GetLeaderboardResponseDto = {
  sprint: {
    id: SPRINT_ID,
    name: sprints[0].name,
    startDate: sprints[0].startDate,
    endDate: sprints[0].endDate,
    ignoreEndDate: false,
    status: "active",
    isEndless: false,
  },
  items: [
    {
      rank: 1,
      ambassadorId: "ambassador-1",
      username: "Алексей Попов",
      promoCode: "STREAM1",
      points: 13720,
      rewards: [
        { rewardId: rewards.money.id, name: rewards.money.name, amount: 1 },
        { rewardId: rewards.shirt.id, name: rewards.shirt.name, amount: 1 },
        { rewardId: rewards.points.id, name: rewards.points.name, amount: 1000 },
        { rewardId: rewards.pro.id, name: rewards.pro.name, amount: 1 },
      ],
    },
    {
      rank: 2,
      ambassadorId: "ambassador-2",
      username: "Сергей Морозов",
      promoCode: "STREAM2",
      points: 2678,
      rewards: [
        { rewardId: rewards.money.id, name: "2 345 ₽", amount: 1 },
        { rewardId: rewards.shirt.id, name: rewards.shirt.name, amount: 1 },
      ],
    },
    {
      rank: 3,
      ambassadorId: "ambassador-3",
      username: "Анастасия Бунова",
      promoCode: "STREAM3",
      points: 1325,
      rewards: [{ rewardId: rewards.money.id, name: "1 121 ₽", amount: 1 }],
    },
    {
      rank: 4,
      ambassadorId: "ambassador-4",
      username: "Юлия Манова",
      promoCode: "STREAM4",
      points: 720,
      rewards: [{ rewardId: rewards.money.id, name: "614 ₽", amount: 1 }],
    },
    {
      rank: 5,
      ambassadorId: "ambassador-5",
      username: "Степан Морозов",
      promoCode: "STREAM5",
      points: 567,
      rewards: [],
    },
  ],
  manualRewards: [
    { rewardId: rewards.money.id, name: rewards.money.name, amount: 1 },
    { rewardId: rewards.shirt.id, name: rewards.shirt.name, amount: 1 },
    { rewardId: rewards.pro.id, name: rewards.pro.name, amount: 3 },
  ],
  page: 1,
  size: 50,
  total: 5,
  totalPages: 1,
};

function paginated<T>(items: T[]) {
  return { items, page: 1, size: Math.max(items.length, 1), total: items.length, totalPages: 1 };
}

function nextEventDate(item: BaseCreativeTaskSubmissionDto) {
  const latest = Math.max(
    Date.parse(item.updatedAt),
    ...item.events.map((event) => Date.parse(event.createdAt)),
  );
  return new Date(latest + 60_000).toISOString();
}

function updateSubmission(
  id: string,
  data: UpdateSubmissionStatusRequestDto,
): BaseCreativeTaskSubmissionDto {
  const current = submissions.find((item) => item.id === id);
  if (!current) throw new Error(`Mock submission not found: ${id}`);

  const isPublicationReview = current.status === "waiting_for_review_publication";
  const status: BaseCreativeTaskSubmissionDto["status"] =
    data.decision === "approve"
      ? isPublicationReview
        ? "approved"
        : "waiting_for_publication"
      : isPublicationReview
        ? "rejected_for_publication"
        : "rejected_for_materials";
  const eventDate = nextEventDate(current);
  const updated: BaseCreativeTaskSubmissionDto = {
    ...current,
    updatedAt: eventDate,
    status,
    reviewComment: data.reviewComment ?? null,
    rewardValue:
      status === "approved" ? (data.rewardValue ?? current.rewardValue) : current.rewardValue,
    events: [
      ...current.events,
      {
        id: `event-${current.id}-${current.events.length + 1}`,
        createdAt: eventDate,
        type:
          data.decision === "approve"
            ? isPublicationReview
              ? "publication_approved"
              : "materials_approved"
            : isPublicationReview
              ? "publication_rejected"
              : "materials_rejected",
        actorType: "project",
        payload:
          data.decision === "approve"
            ? { rewardValue: data.rewardValue }
            : { reviewComment: data.reviewComment },
      },
    ],
  };

  submissions = submissions.map((item) => (item.id === id ? updated : item));
  return updated;
}

async function mockRequest(config: AxiosRequestConfig): Promise<unknown> {
  await new Promise((resolve) => window.setTimeout(resolve, 60));

  const method = (config.method ?? "GET").toUpperCase();
  const url = config.url ?? "";

  if (method === "GET" && url === `/api/rooms/${ROOM_ID}`) return room;
  if (method === "GET" && url === "/api/projects/my") return project;
  if (method === "GET" && url === `/api/events/${ROOM_ID}`) return paginated([]);
  if (method === "GET" && url === `/api/sprints/${ROOM_ID}`) return paginated(sprints);
  if (method === "GET" && url === `/api/sprints/${ROOM_ID}/leaderboard`) return leaderboard;

  const rewardRulesMatch = url.match(/^\/api\/sprints\/([^/]+)\/reward-rules$/);
  if (method === "GET" && rewardRulesMatch) {
    return {
      items: rewardRulesMatch[1] === SPRINT_ID ? rewardRules : [],
    };
  }

  if (method === "GET" && url === `/api/creative-tasks/room/${ROOM_ID}`) {
    return paginated(tasks);
  }

  const submissionsMatch = url.match(/^\/api\/creative-tasks\/([^/]+)\/submissions$/);
  if (method === "GET" && submissionsMatch) {
    return paginated(submissions.filter((item) => item.taskId === submissionsMatch[1]));
  }

  const taskMatch = url.match(/^\/api\/creative-tasks\/([^/]+)$/);
  if (method === "GET" && taskMatch) {
    const item = tasks.find((candidate) => candidate.id === taskMatch[1]);
    if (!item) throw new Error(`Mock task not found: ${taskMatch[1]}`);
    return item;
  }

  if (method === "GET" && url === "/api/ambassador") return paginated(ambassadors);

  const submissionStatusMatch = url.match(
    /^\/api\/creative-tasks\/submissions\/([^/]+)\/status$/,
  );
  if (method === "PATCH" && submissionStatusMatch) {
    return updateSubmission(
      submissionStatusMatch[1],
      config.data as UpdateSubmissionStatusRequestDto,
    );
  }

  if (method === "PATCH" && taskMatch) {
    const index = tasks.findIndex((item) => item.id === taskMatch[1]);
    if (index < 0) throw new Error(`Mock task not found: ${taskMatch[1]}`);
    tasks[index] = { ...tasks[index], ...(config.data as Partial<CreativeTaskWithDefaultsDto>) };
    return tasks[index];
  }

  const sprintMatch = url.match(/^\/api\/sprints\/([^/]+)$/);
  if (method === "PATCH" && sprintMatch) {
    const index = sprints.findIndex((item) => item.id === sprintMatch[1]);
    if (index < 0) throw new Error(`Mock sprint not found: ${sprintMatch[1]}`);
    sprints[index] = { ...sprints[index], ...(config.data as Partial<BaseSprintDto>) };
    return sprints[index];
  }

  throw new Error(`Preview API mock is missing: ${method} ${url}`);
}

export function enableSprintFlowPreview() {
  useAuthStore.setState({ auth: true, token: "" });
  setCustomInstanceMock(mockRequest);
}
