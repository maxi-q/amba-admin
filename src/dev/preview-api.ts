import type { AxiosRequestConfig } from "axios";
import type {
  BaseAmbassadorDto,
  BaseCreativeTaskSubmissionDto,
  BaseRewardDto,
  BaseRoomDto,
  BaseSprintDto,
  CreateCreativeTaskRequestDto,
  CreateSprintRequestDto,
  CreativeTaskWithDefaultsDto,
  GetLeaderboardResponseDto,
  GetProjectResponseDto,
  OrdContractTemplateItemDto,
  SprintRewardRuleDto,
  UpdateSubmissionStatusRequestDto,
} from "@/api/generated/model";
import { setCustomInstanceMock } from "@/api/mutator/custom-instance";
import { useAuthStore } from "@/store";
import rewardGiftUrl from "@/assets/sprint-flow/reward-gift.png";
import rewardMoneyUrl from "@/assets/sprint-flow/reward-money.png";
import { createParticipantsPreview } from "./preview-participants";
import { createOrdProfilePreview } from "./preview-ord-profile";
import { createCompetitionPreview } from "./preview-competitions";
import participantAvatar from "./participant-avatar.png";

const ROOM_ID = "preview-room";
const SPRINT_ID = "sprint-active";
const TASK_ID = "task-review";
const NOW = "2026-08-21T09:00:00.000Z";
const indivisibleReward = { isDivisible: false, divisionPrecision: 0 } as const;
const ambassadorAvatarUrl = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <rect width="24" height="24" rx="6" fill="#e5f1f6"/>
    <ellipse cx="12" cy="13" rx="9" ry="8" fill="#8fc4d7"/>
    <circle cx="8.5" cy="10.5" r="3" fill="#17202a"/>
    <circle cx="15.5" cy="10.5" r="3" fill="#17202a"/>
    <path d="M11.5 10.5h1" stroke="#17202a" stroke-width="1.5"/>
    <ellipse cx="12" cy="14" rx="1.5" ry="1.1" fill="#263746"/>
    <path d="M4 15.5 1.5 14M4.5 17.5 2 18M20 15.5l2.5-1.5M19.5 17.5 22 18" stroke="#526d79" stroke-linecap="round"/>
  </svg>
`)}`;

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

const ordProfilePreview = createOrdProfilePreview(room, new URLSearchParams(window.location.search).get("ord-profile") === "new");

const isSenlerIoPreview = new URLSearchParams(window.location.search).get("provider") === "senler-io";
const project: GetProjectResponseDto = {
  provider: isSenlerIoPreview ? "SENLER_IO" : "SENLER_RU",
  senlerIoProjectId: isSenlerIoPreview ? "preview-senler-io-project" : null,
  groupId: isSenlerIoPreview ? null : 12345,
  id: "preview-project",
  createdAt: NOW,
  updatedAt: NOW,
  name: "Амбассадор",
  channelTypeId: isSenlerIoPreview ? null : 1,
  channelExternalId: isSenlerIoPreview ? null : "12345",
  avatarUrl: null,
};

const ordContractTemplate: OrdContractTemplateItemDto = {
  id: "ord-template-preview",
  createdAt: NOW,
  updatedAt: NOW,
  name: "Основной договор",
  roomId: ROOM_ID,
  type: "service",
  dateStrategy: "today",
  fixedDate: null,
  dateEndStrategy: "none",
  fixedDateEnd: null,
  dateEndOffsetDays: null,
  fixedAmount: null,
  autoGetCid: true,
  actionType: null,
  subjectType: null,
  flags: [],
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
  reviewStartedAt: status === 'active' ? null : NOW,
  resultsFixedAt: null,
  completedAt: status === 'completed' ? NOW : null,
  isDraft: false,
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

let sprints: BaseSprintDto[] = [
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
  {
    ...sprint("sprint-draft", "", NOW, null),
    name: null,
    description: null,
    startDate: null,
    rewardType: null,
    rewardUnits: null,
    rewardValue: null,
    promoCodeUsageLimit: null,
    isDraft: true,
  },
];
let reviewFailureRemaining = new URLSearchParams(window.location.search).has("review-fail-once");

const task = (
  id: string,
  title: string,
  description: string,
): CreativeTaskWithDefaultsDto => ({
  id,
  createdAt: NOW,
  updatedAt: NOW,
  ordContractTemplateId: ordContractTemplate.id,
  ordContractTemplate,
  title,
  description,
  isDeleted: false,
  isFrozen: false,
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
  ordForm: "video",
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

let tasks: CreativeTaskWithDefaultsDto[] = [
  task(TASK_ID, "Снимите обзор на сервис", "Снимите короткий обзор StreamVi и покажите основной сценарий работы."),
  {
    ...task(
      "task-publication",
      "Сделайте пост о своем опыте со StreamVi",
      "Поделитесь личным опытом использования сервиса."
    ),
    publicationsCount: 3,
    targetPlatform: "VK_USER",
  },
  {
    ...task("task-reviewed", "Расскажите о первой трансляции", "Опишите подготовку и результат первой трансляции."),
    isFrozen: true,
    targetPlatform: "VK_GROUP",
  },
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
  subscriberId: String(10001 + index),
  avatarUrl: ambassadorAvatarUrl,
}));

const participantsPreview = createParticipantsPreview(ambassadors, participantAvatar);

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
  comment: status === "waiting_for_review_materials" ? "Материалы готовы к проверке" : "Публикация готова к проверке",
  reviewComment: null,
  rewardValue,
  items: [{ ...submissionItem, id: `${id}-item`, ...(["new", "waiting_for_review_materials", "rejected_for_materials"].includes(status) ? { publicationUrl: null, erid: null } : {}) }],
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
  money: { id: "reward-money", versionId: "reward-money-v1", version: 1, name: "Рубли", iconUrl: rewardMoneyUrl, ...indivisibleReward },
  shirt: { id: "reward-shirt", versionId: "reward-shirt-v1", version: 1, name: "Футболка", iconUrl: rewardGiftUrl, ...indivisibleReward },
  pro: { id: "reward-pro", versionId: "reward-pro-v1", version: 1, name: "Тариф Pro", iconUrl: rewardGiftUrl, ...indivisibleReward },
  points: { id: "reward-points", versionId: "reward-points-v1", version: 1, name: "Баллы Senler", iconUrl: rewardGiftUrl, ...indivisibleReward },
};

const sprintReward = (
  id: string,
  reward: (typeof rewards)[keyof typeof rewards],
  amount: number,
) => ({ id, rewardId: reward.id, rewardVersionId: reward.versionId, amount, reward });

const leaderboardRewardVersion = (reward: (typeof rewards)[keyof typeof rewards]) => ({
  rewardVersionId: reward.versionId,
  rewardVersion: reward.version,
});

let catalogRewards: BaseRewardDto[] = [
  {
    id: rewards.money.id,
    version: 2,
    createdAt: NOW,
    updatedAt: NOW,
    name: "Рубли",
    iconUrl: rewardMoneyUrl,
    iconUploadedAt: NOW,
    photos: [],
    isDivisible: false,
    divisionPrecision: 0,
    isDeleted: false,
    roomId: ROOM_ID,
  },
  {
    id: rewards.points.id,
    version: 2,
    createdAt: NOW,
    updatedAt: NOW,
    name: "Баллы Senler",
    iconUrl: rewardGiftUrl,
    iconUploadedAt: NOW,
    photos: [],
    isDivisible: true,
    divisionPrecision: 5,
    isDeleted: false,
    roomId: ROOM_ID,
  },
  {
    id: rewards.shirt.id,
    version: 1,
    createdAt: NOW,
    updatedAt: NOW,
    name: "Футболка",
    iconUrl: rewardGiftUrl,
    iconUploadedAt: NOW,
    photos: [],
    isDivisible: false,
    divisionPrecision: 0,
    isDeleted: false,
    roomId: ROOM_ID,
  },
  {
    id: rewards.pro.id,
    version: 1,
    createdAt: NOW,
    updatedAt: NOW,
    name: "Тариф Pro",
    iconUrl: rewardGiftUrl,
    iconUploadedAt: NOW,
    photos: [],
    isDivisible: false,
    divisionPrecision: 0,
    isDeleted: false,
    roomId: ROOM_ID,
  },
];

const currentRewardSummary = (reward: BaseRewardDto) => ({
  id: reward.id,
  versionId: `${reward.id}-v${reward.version}`,
  version: reward.version,
  name: reward.name,
  iconUrl: reward.iconUrl,
  isDivisible: reward.isDivisible,
  divisionPrecision: reward.divisionPrecision,
});

let rewardRules: SprintRewardRuleDto[] = [
  {
    id: "rule-rating",
    createdAt: NOW,
    updatedAt: NOW,
    sprintId: SPRINT_ID,
    type: "byRank",
    rankFrom: 1,
    rankTo: 1,
    minPoints: null,
    rewards: [
      sprintReward("rule-money", rewards.money, 5_000),
      sprintReward("rule-shirt", rewards.shirt, 1),
      sprintReward("rule-pro", rewards.pro, 1),
    ],
  },
  {
    id: "rule-rating-secondary",
    createdAt: NOW,
    updatedAt: NOW,
    sprintId: SPRINT_ID,
    type: "byRank",
    rankFrom: 2,
    rankTo: 3,
    minPoints: null,
    rewards: [
      sprintReward("rule-money-secondary", rewards.money, 1_000),
      sprintReward("rule-points-secondary", rewards.points, 500),
    ],
  },
  {
    id: "rule-proportional",
    createdAt: NOW,
    updatedAt: NOW,
    sprintId: SPRINT_ID,
    type: "byPoints",
    rankFrom: null,
    rankTo: 10,
    minPoints: null,
    rewards: [
      sprintReward("rule-money-proportional", rewards.money, 5_000),
      sprintReward("rule-points-proportional", rewards.points, 1_000),
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
      sprintReward("manual-money", rewards.money, 5_000),
      sprintReward("manual-points", rewards.points, 1_000),
    ],
  },
];

const leaderboard: GetLeaderboardResponseDto = {
  isFinal: false, resultsFixedAt: null, historyUnavailable: false, manualPositions: [],
  sprint: {
    id: SPRINT_ID,
    name: sprints[0].name ?? "Черновик спринта",
    startDate: sprints[0].startDate ?? NOW,
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
      avatarUrl: ambassadorAvatarUrl,
      promoCode: "STREAM1",
      points: 13720,
      taskPoints: 13620, promoPoints: 100,
      rewards: [
        { rewardId: rewards.money.id, name: rewards.money.name, amount: 5000, ...leaderboardRewardVersion(rewards.money), ...indivisibleReward },
        { rewardId: rewards.shirt.id, name: rewards.shirt.name, amount: 1, ...leaderboardRewardVersion(rewards.shirt), ...indivisibleReward },
        { rewardId: rewards.points.id, name: rewards.points.name, amount: 1000, ...leaderboardRewardVersion(rewards.points), ...indivisibleReward },
        { rewardId: rewards.pro.id, name: rewards.pro.name, amount: 1, ...leaderboardRewardVersion(rewards.pro), ...indivisibleReward },
      ],
    },
    {
      rank: 2,
      ambassadorId: "ambassador-2",
      username: "Сергей Морозов",
      avatarUrl: ambassadorAvatarUrl,
      promoCode: "STREAM2",
      points: 2678,
      taskPoints: 2678, promoPoints: 0,
      rewards: [
        { rewardId: rewards.money.id, name: rewards.money.name, amount: 2345, ...leaderboardRewardVersion(rewards.money), ...indivisibleReward },
        { rewardId: rewards.shirt.id, name: rewards.shirt.name, amount: 1, ...leaderboardRewardVersion(rewards.shirt), ...indivisibleReward },
      ],
    },
    {
      rank: 3,
      ambassadorId: "ambassador-3",
      username: "Анастасия Бунова",
      avatarUrl: ambassadorAvatarUrl,
      promoCode: "STREAM3",
      points: 1325,
      taskPoints: 1325, promoPoints: 0,
      rewards: [{ rewardId: rewards.money.id, name: rewards.money.name, amount: 1121, ...leaderboardRewardVersion(rewards.money), ...indivisibleReward }],
    },
    {
      rank: 4,
      ambassadorId: "ambassador-4",
      username: "Юлия Манова",
      avatarUrl: ambassadorAvatarUrl,
      promoCode: "STREAM4",
      points: 720,
      taskPoints: 720, promoPoints: 0,
      rewards: [{ rewardId: rewards.money.id, name: rewards.money.name, amount: 614, ...leaderboardRewardVersion(rewards.money), ...indivisibleReward }],
    },
    {
      rank: 5,
      ambassadorId: "ambassador-5",
      username: "Степан Морозов",
      avatarUrl: ambassadorAvatarUrl,
      promoCode: "STREAM5",
      points: 567,
      taskPoints: 567, promoPoints: 0,
      rewards: [],
    },
  ],
  manualRewards: [
    { rewardId: rewards.money.id, name: rewards.money.name, amount: 5000, ...leaderboardRewardVersion(rewards.money), ...indivisibleReward },
    { rewardId: rewards.shirt.id, name: rewards.shirt.name, amount: 1, ...leaderboardRewardVersion(rewards.shirt), ...indivisibleReward },
    { rewardId: rewards.pro.id, name: rewards.pro.name, amount: 3, ...leaderboardRewardVersion(rewards.pro), ...indivisibleReward },
  ],
  page: 1,
  size: 50,
  total: 5,
  totalPages: 1,
};

function getActiveLeaderboard(): GetLeaderboardResponseDto {
  // The API returns the company's active sprint, not the sprint being viewed.
  const selectedSprint = sprints.find((item) => item.id === SPRINT_ID && item.status === "active" && !item.isDraft);
  if (!selectedSprint) return { ...leaderboard, sprint: null, items: [], manualRewards: [], total: 0, totalPages: 0 };

  return {
    ...leaderboard,
    sprint: {
      id: selectedSprint.id,
      name: selectedSprint.name ?? "Черновик спринта",
      startDate: selectedSprint.startDate ?? NOW,
      endDate: selectedSprint.endDate,
      ignoreEndDate: selectedSprint.ignoreEndDate,
      status: selectedSprint.status,
      isEndless: selectedSprint.ignoreEndDate,
    },
  };
}

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

function requestData<T>(config: AxiosRequestConfig): T {
  return (typeof config.data === "string"
    ? JSON.parse(config.data)
    : config.data ?? {}) as T;
}

const previewUpload = {
  url: "https://preview.invalid/reward-upload",
  key: "preview/reward-upload",
  maxBytes: 10 * 1024 * 1024,
  expiresIn: 600,
};

const rewardPhotoDrafts = new Map<string, { rewardId: string; sortOrder: number }>();
const competitionPreview = createCompetitionPreview();

async function mockRequest(config: AxiosRequestConfig): Promise<unknown> {
  const method = (config.method ?? "GET").toUpperCase();
  const url = config.url ?? "";
  const rewardRulesMatch = url.match(/^\/api\/sprints\/([^/]+)\/reward-rules$/);
  const rewardVersionsMatch = url.match(/^\/api\/sprints\/([^/]+)\/reward-versions$/);

  await new Promise((resolve) => window.setTimeout(resolve, 60));

  const competitionResponse = competitionPreview(config, { roomId: ROOM_ID, sprints, rules: rewardRules, rewards: catalogRewards.map(currentRewardSummary), entries: leaderboard.items, tasks, submissions });
  if (competitionResponse) return competitionResponse.data;

  const participantResponse = participantsPreview(config);
  if (participantResponse !== undefined) return participantResponse;

  const ordProfileResponse = ordProfilePreview(config);
  if (ordProfileResponse !== undefined) return ordProfileResponse;
  if (method === "GET" && url === "/api/rooms/my") return [room];
  if (method === "GET" && url === "/api/projects/my") return project;
  if (method === "GET" && url === `/api/events/${ROOM_ID}`) return paginated([]);
  if (method === "GET" && url === `/api/sprints/${ROOM_ID}`) {
    const reviewTaskIds = new Set(
      submissions
        .filter((item) => item.status.startsWith("waiting_for_review"))
        .map((item) => item.taskId),
    );
    return paginated(sprints.map((item) => ({
      ...item,
      ...(config.params?.include === "tasksToReviewCount"
        ? {
            tasksToReviewCount: tasks.filter(
              (taskItem) => taskItem.sprintId === item.id && reviewTaskIds.has(taskItem.id),
            ).length,
          }
        : {}),
    })));
  }
  if (method === "GET" && url === `/api/rooms/${ROOM_ID}/ord-contract-templates`) {
    return paginated([ordContractTemplate]);
  }
  if (method === "GET" && url === `/api/rooms/${ROOM_ID}/ord-files`) {
    return paginated([
      {
        id: "ord-file-preview",
        createdAt: NOW,
        updatedAt: NOW,
        title: "Обложка StreamVi",
        status: "synced",
        uploadedAt: NOW,
        syncedAt: NOW,
        filename: "streamvi-cover.jpg",
        sha256: "preview",
        ordCreatedAt: NOW,
        sizeBytes: 1024,
        contentType: "image/jpeg",
        description: null,
        roomId: ROOM_ID,
        ambassadorId: null,
        isTemplate: true,
      },
    ]);
  }
  if (method === "GET" && url === "/api/ord/dict/kktu") {
    return paginated([
      { code: "28.99.39.190", name: "Программное обеспечение и сервисы" },
    ]);
  }
  if (method === "GET" && url === `/api/sprints/${ROOM_ID}/leaderboard`) {
    return getActiveLeaderboard();
  }
  if (method === "GET" && url === "/api/vk-auth/me") {
    return {
      authorized: true,
      status: "active",
      reviewStartedAt: null, resultsFixedAt: null, completedAt: null,
      vkUserId: "1",
      expiresAt: "2026-12-31T20:59:59.000Z",
      scopes: ["wall", "photos"],
    };
  }

  if (method === "PATCH" && rewardVersionsMatch) {
    const rewardIds = new Set(requestData<{ rewardIds: string[] }>(config).rewardIds);
    let updatedCount = 0;
    rewardRules = rewardRules.map((rule) => {
      if (rule.sprintId !== rewardVersionsMatch[1]) return rule;
      return {
        ...rule,
        rewards: rule.rewards.map((item) => {
          const catalogReward = catalogRewards.find((reward) => reward.id === item.rewardId);
          if (!rewardIds.has(item.rewardId) || !catalogReward) return item;
          updatedCount += 1;
          const reward = currentRewardSummary(catalogReward);
          return { ...item, rewardVersionId: reward.versionId, reward };
        }),
      };
    });
    const updateLeaderboardReward = (item: GetLeaderboardResponseDto["manualRewards"][number]) => {
      const catalogReward = catalogRewards.find((reward) => reward.id === item.rewardId);
      return rewardIds.has(item.rewardId) && catalogReward
        ? {
            ...item,
            rewardVersionId: `${catalogReward.id}-v${catalogReward.version}`,
            rewardVersion: catalogReward.version,
          }
        : item;
    };
    leaderboard.items = leaderboard.items.map((item) => ({
      ...item,
      rewards: item.rewards.map(updateLeaderboardReward),
    }));
    leaderboard.manualRewards = leaderboard.manualRewards.map(updateLeaderboardReward);
    return {
      updatedCount,
      items: rewardRules.filter((rule) => rule.sprintId === rewardVersionsMatch[1]),
    };
  }

  if (method === "POST" && rewardRulesMatch) {
    const data = requestData<Pick<SprintRewardRuleDto, "type" | "rankFrom" | "rankTo" | "minPoints"> & {
      rewards: Array<{ rewardId: string; amount: number | string }>;
    }>(config);
    const created: SprintRewardRuleDto = {
      id: `rule-${crypto.randomUUID()}`,
      createdAt: NOW,
      updatedAt: NOW,
      sprintId: rewardRulesMatch[1],
      type: data.type,
      rankFrom: data.rankFrom,
      rankTo: data.rankTo,
      minPoints: data.minPoints,
      rewards: data.rewards.map((item) => ({
        id: `rule-reward-${crypto.randomUUID()}`,
        rewardId: item.rewardId,
        rewardVersionId: `${item.rewardId}-v${catalogRewards.find((reward) => reward.id === item.rewardId)?.version ?? 1}`,
        amount: Number(item.amount),
        reward: catalogRewards.find((reward) => reward.id === item.rewardId)
          ? currentRewardSummary(catalogRewards.find((reward) => reward.id === item.rewardId)!)
          : { id: item.rewardId, versionId: null, version: 1, name: "Награда", iconUrl: null, isDivisible: false, divisionPrecision: 0 },
      })),
    };
    rewardRules = [...rewardRules, created];
    return created;
  }

  const rewardRuleMatch = url.match(/^\/api\/sprints\/reward-rules\/([^/]+)$/);
  if (method === "PATCH" && rewardRuleMatch) {
    const index = rewardRules.findIndex((rule) => rule.id === rewardRuleMatch[1]);
    if (index < 0) throw new Error(`Mock reward rule not found: ${rewardRuleMatch[1]}`);
    const data = requestData<Pick<SprintRewardRuleDto, "type" | "rankFrom" | "rankTo" | "minPoints"> & {
      rewards: Array<{ rewardId: string; amount: number | string }>;
    }>(config);
    rewardRules[index] = {
      ...rewardRules[index],
      ...data,
      updatedAt: NOW,
      rewards: data.rewards.map((item) => ({
        id: `rule-reward-${crypto.randomUUID()}`,
        rewardId: item.rewardId,
        rewardVersionId: `${item.rewardId}-v${catalogRewards.find((reward) => reward.id === item.rewardId)?.version ?? 1}`,
        amount: Number(item.amount),
        reward: catalogRewards.find((reward) => reward.id === item.rewardId)
          ? currentRewardSummary(catalogRewards.find((reward) => reward.id === item.rewardId)!)
          : { id: item.rewardId, versionId: null, version: 1, name: "Награда", iconUrl: null, isDivisible: false, divisionPrecision: 0 },
      })),
    };
    return rewardRules[index];
  }
  if (method === "DELETE" && rewardRuleMatch) {
    rewardRules = rewardRules.filter((rule) => rule.id !== rewardRuleMatch[1]);
    return undefined;
  }
  if (method === "GET" && url === "/api/vk-auth/url") {
    return {
      url: "about:blank",
      expiresAt: "2026-08-21T09:10:00.000Z",
    };
  }

  if (method === "GET" && url === `/api/rewards/room/${ROOM_ID}`) {
    return paginated(catalogRewards);
  }

  if (method === "POST" && url === "/api/rewards") {
    const data = requestData<{
      name: string;
      roomId: string;
      isDivisible?: boolean;
      divisionPrecision?: number;
    }>(config);
    const id = `reward-${crypto.randomUUID()}`;
    const created: BaseRewardDto = {
      id,
      version: 1,
      createdAt: NOW,
      updatedAt: NOW,
      name: data.name,
      iconUrl: null,
      iconUploadedAt: null,
      photos: [],
      isDivisible: data.isDivisible ?? false,
      divisionPrecision: data.isDivisible ? (data.divisionPrecision ?? 1) : 0,
      isDeleted: false,
      roomId: data.roomId,
    };
    catalogRewards = [...catalogRewards, created];
    return { ...created, iconUpload: previewUpload };
  }

  const rewardIconUploadMatch = url.match(/^\/api\/rewards\/([^/]+)\/icon\/upload-url$/);
  if (method === "POST" && rewardIconUploadMatch) return previewUpload;

  const rewardIconConfirmMatch = url.match(/^\/api\/rewards\/([^/]+)\/icon\/confirm$/);
  if (method === "POST" && rewardIconConfirmMatch) {
    const index = catalogRewards.findIndex((item) => item.id === rewardIconConfirmMatch[1]);
    if (index < 0) throw new Error(`Mock reward not found: ${rewardIconConfirmMatch[1]}`);
    catalogRewards[index] = {
      ...catalogRewards[index],
      iconUrl: rewardGiftUrl,
      iconUploadedAt: NOW,
      updatedAt: NOW,
    };
    return catalogRewards[index];
  }

  const rewardPhotosMatch = url.match(/^\/api\/rewards\/([^/]+)\/photos$/);
  if (method === "POST" && rewardPhotosMatch) {
    const data = requestData<{ sortOrder?: number }>(config);
    const photoId = `reward-photo-${crypto.randomUUID()}`;
    rewardPhotoDrafts.set(photoId, {
      rewardId: rewardPhotosMatch[1],
      sortOrder: data.sortOrder ?? 0,
    });
    return { photoId, upload: previewUpload };
  }

  const rewardPhotoConfirmMatch = url.match(
    /^\/api\/rewards\/([^/]+)\/photos\/([^/]+)\/confirm$/,
  );
  if (method === "POST" && rewardPhotoConfirmMatch) {
    const [rewardId, photoId] = rewardPhotoConfirmMatch.slice(1);
    const index = catalogRewards.findIndex((item) => item.id === rewardId);
    const draft = rewardPhotoDrafts.get(photoId);
    if (index < 0 || !draft) throw new Error(`Mock reward photo not found: ${photoId}`);
    catalogRewards[index] = {
      ...catalogRewards[index],
      photos: [
        ...catalogRewards[index].photos,
        {
          id: photoId,
          createdAt: NOW,
          updatedAt: NOW,
          url: rewardGiftUrl,
          contentType: "image/png",
          sizeBytes: 1,
          sortOrder: draft.sortOrder,
        },
      ],
    };
    rewardPhotoDrafts.delete(photoId);
    return catalogRewards[index];
  }

  const rewardPhotoMatch = url.match(/^\/api\/rewards\/([^/]+)\/photos\/([^/]+)$/);
  if (method === "DELETE" && rewardPhotoMatch) {
    const index = catalogRewards.findIndex((item) => item.id === rewardPhotoMatch[1]);
    if (index >= 0) {
      catalogRewards[index] = {
        ...catalogRewards[index],
        photos: catalogRewards[index].photos.filter(
          (photo) => photo.id !== rewardPhotoMatch[2],
        ),
      };
    }
    return undefined;
  }

  const rewardMatch = url.match(/^\/api\/rewards\/([^/]+)$/);
  if (method === "GET" && rewardMatch) {
    return catalogRewards.find((item) => item.id === rewardMatch[1]);
  }
  if (method === "PATCH" && rewardMatch) {
    const index = catalogRewards.findIndex((item) => item.id === rewardMatch[1]);
    if (index < 0) throw new Error(`Mock reward not found: ${rewardMatch[1]}`);
    catalogRewards[index] = {
      ...catalogRewards[index],
      ...requestData<Partial<BaseRewardDto>>(config),
      version: catalogRewards[index].version + 1,
      updatedAt: NOW,
    };
    return catalogRewards[index];
  }
  if (method === "DELETE" && rewardMatch) {
    const index = catalogRewards.findIndex((item) => item.id === rewardMatch[1]);
    if (index >= 0) catalogRewards[index] = { ...catalogRewards[index], isDeleted: true };
    return undefined;
  }

  if (method === "GET" && rewardRulesMatch) {
    return {
      items: rewardRules.filter(
        (rule) => rule.sprintId === rewardRulesMatch[1]
      ),
    };
  }

  if (method === "GET" && url === `/api/creative-tasks/room/${ROOM_ID}`) {
    return paginated(tasks.filter((task) => !task.isDeleted && (!config.params?.sprintId || task.sprintId === config.params.sprintId)));
  }

  if (method === "POST" && url === "/api/creative-tasks") {
    const data = requestData<CreateCreativeTaskRequestDto>(config);
    const created: CreativeTaskWithDefaultsDto = {
      ...data,
      id: `task-${crypto.randomUUID()}`,
      createdAt: NOW,
      updatedAt: NOW,
      ordContractTemplate: data.ordContractTemplateId === ordContractTemplate.id
        ? ordContractTemplate
        : null,
      isDeleted: false,
      isFrozen: false,
      defaultMediaIds: data.defaultMediaIds ?? [],
      defaultTexts: data.defaultTexts ?? [],
      defaultTargetUrls: data.defaultTargetUrls ?? [],
    };
    tasks = [...tasks, created];
    return created;
  }


  const submissionsMatch = url.match(/^\/api\/creative-tasks\/([^/]+)\/submissions$/);
  if (method === "GET" && submissionsMatch) {
    return paginated(submissions.filter((item) => item.taskId === submissionsMatch[1]));
  }

  const submissionMatch = url.match(/^\/api\/creative-tasks\/submissions\/([^/]+)$/);
  if (method === "GET" && submissionMatch) {
    const item = submissions.find((candidate) => candidate.id === submissionMatch[1]);
    if (!item) throw new Error(`Mock submission not found: ${submissionMatch[1]}`);
    return item;
  }

  const taskFreezeMatch = url.match(
    /^\/api\/creative-tasks\/([^/]+)\/(freeze|unfreeze)$/,
  );
  if (method === "PATCH" && taskFreezeMatch) {
    const index = tasks.findIndex((item) => item.id === taskFreezeMatch[1]);
    if (index < 0) throw new Error(`Mock task not found: ${taskFreezeMatch[1]}`);
    tasks[index] = {
      ...tasks[index],
      isFrozen: taskFreezeMatch[2] === "freeze",
      updatedAt: NOW,
    };
    return tasks[index];
  }

  const taskMatch = url.match(/^\/api\/creative-tasks\/([^/]+)$/);
  if (method === "GET" && taskMatch) {
    const item = tasks.find((candidate) => candidate.id === taskMatch[1]);
    if (!item) throw new Error(`Mock task not found: ${taskMatch[1]}`);
    return item;
  }

  if (method === "GET" && url === "/api/ambassador") {
    return paginated(ambassadors.filter((item) => !config.params?.ambassadorIds?.length || config.params.ambassadorIds.includes(item.id)));
  }

  const submissionStatusMatch = url.match(
    /^\/api\/creative-tasks\/submissions\/([^/]+)\/status$/,
  );
  if (method === "PATCH" && submissionStatusMatch) {
    const submission = submissions.find((item) => item.id === submissionStatusMatch[1]);
    const task = tasks.find((item) => item.id === submission?.taskId);
    if (sprints.find((item) => item.id === task?.sprintId)?.resultsFixedAt) throw new Error("Итоги уже зафиксированы. Проверка закрыта.");
    if (reviewFailureRemaining) {
      reviewFailureRemaining = false;
      throw new Error("Демо: не удалось сохранить решение. Повторите отправку — введённые данные сохранены.");
    }
    return updateSubmission(
      submissionStatusMatch[1],
      config.data as UpdateSubmissionStatusRequestDto,
    );
  }

  if (method === "PATCH" && taskMatch) {
    const index = tasks.findIndex((item) => item.id === taskMatch[1]);
    if (index < 0) throw new Error(`Mock task not found: ${taskMatch[1]}`);
    const data = requestData<Partial<CreativeTaskWithDefaultsDto>>(config);
    tasks[index] = {
      ...tasks[index],
      ...data,
      ...(data.ordContractTemplateId
        ? {
            ordContractTemplate: data.ordContractTemplateId === ordContractTemplate.id
              ? ordContractTemplate
              : null,
          }
        : {}),
      updatedAt: NOW,
    };
    return tasks[index];
  }

  if (method === "POST" && url === "/api/sprints") {
    const data = requestData<CreateSprintRequestDto>(config);
    const created: BaseSprintDto = {
      id: `sprint-${crypto.randomUUID()}`,
      createdAt: NOW,
      updatedAt: NOW,
      name: data.name ?? null,
      description: data.description ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      ignoreEndDate: data.ignoreEndDate ?? false,
      status: "active",
      isDraft: data.isDraft ?? false,
      reviewStartedAt: null,
      resultsFixedAt: null,
      completedAt: null,
      rewardType: data.rewardType ?? null,
      rewardUnits: data.rewardUnits ?? null,
      rewardValue: data.rewardValue ?? null,
      promoCodeUsagesCount: 0,
      promoCodeUsageLimit: data.promoCodeUsageLimit ?? null,
      ignorePromoCodeUsageLimit: data.ignorePromoCodeUsageLimit ?? false,
      pendingSubscriptionId: 201,
      approvedSubscriptionId: 202,
      rejectedSubscriptionId: 203,
      roomId: data.roomId,
    };
    sprints = [...sprints, created];
    return created;
  }

  const sprintMatch = url.match(/^\/api\/sprints\/([^/]+)$/);
  if (method === "DELETE" && sprintMatch) {
    sprints = sprints.filter((item) => item.id !== sprintMatch[1]);
    tasks = tasks.filter((item) => item.sprintId !== sprintMatch[1]);
    rewardRules = rewardRules.filter((item) => item.sprintId !== sprintMatch[1]);
    return undefined;
  }
  if (method === "PATCH" && sprintMatch) {
    const index = sprints.findIndex((item) => item.id === sprintMatch[1]);
    if (index < 0) throw new Error(`Mock sprint not found: ${sprintMatch[1]}`);
    sprints[index] = {
      ...sprints[index],
      ...requestData<Partial<BaseSprintDto>>(config),
      updatedAt: NOW,
    };
    return sprints[index];
  }

  throw new Error(`Preview API mock is missing: ${method} ${url}`);
}

export function enableSprintFlowPreview() {
  useAuthStore.setState({ auth: true, token: "" });
  setCustomInstanceMock(mockRequest);
  const realFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const target = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return target.startsWith("https://preview.invalid/")
      ? Promise.resolve(new Response(null, { status: 200 }))
      : realFetch(input, init);
  };
}
