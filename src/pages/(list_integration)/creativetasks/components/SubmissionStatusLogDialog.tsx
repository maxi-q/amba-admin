import { useEffect, useState } from "react";
import type {
  BaseCreativeTaskSubmissionDto,
  CreativeTaskSubmissionEventDto,
  CreativeTaskSubmissionEventDtoType,
} from "@/api/generated/model";
import {
  Alert,
  AlertDescription,
  Button,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@senler/ui";
import checkIcon from "../assets/task-status-log/check.png";
import closeIcon from "../assets/task-status-log/close.svg";
import loaderIcon from "../assets/task-status-log/loader.png";
import megaphoneIcon from "../assets/task-status-log/megaphone.png";
import pencilRulerIcon from "../assets/task-status-log/pencil-ruler.png";
import rejectIcon from "../assets/task-status-log/reject.png";
import timelineUrl from "../assets/task-status-log/timeline.svg";
import { isReviewableSubmissionStatus } from "../submissionStatus";
import { getSubmissionLink } from "../submissionContent.utils";
import { SubmissionContentPreview } from "./SubmissionContentPreview";

type ActionMode = "idle" | "reject" | "approve";

const EVENT_DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const EVENT_META: Record<
  CreativeTaskSubmissionEventDtoType,
  { title: string; projectTitle?: string; icon: string }
> = {
  created: { title: "Ответ создан", icon: pencilRulerIcon },
  materials_submitted: { title: "Исполнитель выполнил задание", icon: pencilRulerIcon },
  materials_approved: {
    title: "Материалы приняты",
    projectTitle: "Вы приняли задание",
    icon: checkIcon,
  },
  materials_rejected: {
    title: "Материалы отклонены",
    projectTitle: "Вы отклонили задание",
    icon: rejectIcon,
  },
  materials_updated: { title: "Исполнитель внес правки", icon: pencilRulerIcon },
  publication_url_updated: {
    title: "Исполнитель добавил ссылку на публикацию",
    icon: megaphoneIcon,
  },
  publication_reported: { title: "Исполнитель опубликовал задание", icon: megaphoneIcon },
  publication_approved: {
    title: "Публикация принята",
    projectTitle: "Вы приняли публикацию",
    icon: checkIcon,
  },
  publication_rejected: {
    title: "Публикация отклонена",
    projectTitle: "Вы отклонили публикацию",
    icon: rejectIcon,
  },
  comment_updated: {
    title: "Исполнитель изменил комментарий",
    projectTitle: "Вы изменили комментарий",
    icon: pencilRulerIcon,
  },
};

interface SubmissionStatusLogDialogProps {
  open: boolean;
  submission: BaseCreativeTaskSubmissionDto | null;
  minimalRewardInBalls: number;
  onClose: () => void;
  onApprove: (submission: BaseCreativeTaskSubmissionDto, rewardValue?: number) => void;
  onReject: (submission: BaseCreativeTaskSubmissionDto, reviewComment: string) => void;
  isPending: boolean;
  reviewDisabled?: boolean;
  errorMessage?: string;
}

function formatEventDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : EVENT_DATE_FORMATTER.format(date).replace(",", "");
}

function getEventComment(event: CreativeTaskSubmissionEventDto) {
  const payload = event.payload;
  if (!payload || typeof payload !== "object") return null;

  for (const key of ["reviewComment", "comment"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return null;
}

function StatusIcon({ src }: { src: string }) {
  return (
    <span className="relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0]">
      <img src={src} alt="" width={14} height={14} className="size-[14px]" />
    </span>
  );
}

function EventRow({
  event,
  rewardValue,
}: {
  event: CreativeTaskSubmissionEventDto;
  rewardValue: number;
}) {
  const meta = EVENT_META[event.type];
  const comment =
    event.type === "materials_rejected" ||
    event.type === "publication_rejected" ||
    event.type === "comment_updated"
      ? getEventComment(event)
      : null;
  const title = event.actorType === "project" && meta.projectTitle ? meta.projectTitle : meta.title;
  const detail =
    event.type === "publication_approved"
      ? `Начислено ${rewardValue.toLocaleString("ru-RU")} XP`
      : formatEventDate(event.createdAt);

  return (
    <div className="relative flex items-start gap-3">
      <StatusIcon src={meta.icon} />
      <div className="min-w-0 flex-1 break-words text-[13px] font-medium leading-4 tracking-[-0.0325px]">
        <p className="text-black">{title}</p>
        <p className="mt-1 text-[#797979]">{detail}</p>
        {comment ? (
          <div className="mt-3">
            <p className="text-[#797979]">
              {event.actorType === "project" ? "Вы написали" : "Исполнитель написал"}
            </p>
            <p className="mt-1 rounded-[6px] bg-[#f0f0f0] p-1 text-xs leading-4 text-black">
              {comment}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const SECONDARY_BUTTON_CLASS =
  "h-7 rounded-[6px] border-[#e4e4e4] bg-white px-2 text-[13px] font-medium leading-4 text-black shadow-none hover:bg-[#f7f7f7]";

function ReviewStep({
  submission,
  minimalRewardInBalls,
  actionMode,
  setActionMode,
  reviewComment,
  setReviewComment,
  rewardValue,
  setRewardValue,
  onApprove,
  onReject,
  isPending,
  reviewDisabled,
}: {
  submission: BaseCreativeTaskSubmissionDto;
  minimalRewardInBalls: number;
  actionMode: ActionMode;
  setActionMode: (value: ActionMode) => void;
  reviewComment: string;
  setReviewComment: (value: string) => void;
  rewardValue: string;
  setRewardValue: (value: string) => void;
  onApprove: (submission: BaseCreativeTaskSubmissionDto, rewardValue?: number) => void;
  onReject: (submission: BaseCreativeTaskSubmissionDto, reviewComment: string) => void;
  isPending: boolean;
  reviewDisabled: boolean;
}) {
  if (!isReviewableSubmissionStatus(submission.status)) return null;

  if (reviewDisabled) {
    return (
      <div className="relative flex items-start gap-3">
        <StatusIcon src={loaderIcon} />
        <div className="min-w-0 flex-1 text-[13px] font-medium leading-4 tracking-[-0.0325px]">
          <p className="text-black">Проверка приостановлена</p>
          <p className="mt-1 text-[#797979]">
            Возобновите задание, чтобы принять или отклонить выполнение.
          </p>
        </div>
      </div>
    );
  }

  const isPublicationReview = submission.status === "waiting_for_review_publication";
  const publicationUrls = submission.items
    .map((item) => item.publicationUrl)
    .filter((url): url is string => Boolean(url && getSubmissionLink(url)));
  const parsedReward = Number(rewardValue);
  const rewardIsValid = rewardValue.trim() !== "" && Number.isFinite(parsedReward) && parsedReward >= minimalRewardInBalls;

  return (
    <div className="relative flex items-start gap-3">
      <StatusIcon src={loaderIcon} />
      <div className="min-w-0 flex-1 break-words text-[13px] font-medium leading-4 tracking-[-0.0325px]">
        <div className="space-y-1">
          <p className="text-black">
            {isPublicationReview ? "Проверьте публикацию" : "Проверьте задание"}
          </p>
          <p className="text-[#797979]">
            {isPublicationReview
              ? "Изучите публикацию на соответствие вашим требованиям"
              : "Изучите материалы на соответствие вашим требованиям"}
          </p>
        </div>

        {actionMode === "idle" && publicationUrls.length > 0 ? (
          <div className="mt-3 space-y-1">
            <p className="text-[#797979]">Ссылка на публикацию</p>
            {publicationUrls.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-[#2563eb]"
              >
                {url}
              </a>
            ))}
          </div>
        ) : null}

        {actionMode === "reject" ? (
          <div className="mt-3 space-y-2">
            <p className="text-[#797979]">Укажите причину отказа</p>
            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              className="h-[72px] w-full resize-none rounded-[6px] border border-[#e4e4e4] bg-white p-3 text-[13px] font-medium leading-4 text-black outline-none focus:border-[#797979]"
              aria-label="Причина отказа"
            />
          </div>
        ) : null}

        {actionMode === "approve" ? (
          <div className="mt-3 space-y-2">
            <p className="text-[#797979]">Укажите количество очков (XP)</p>
            <input
              type="number"
              min={minimalRewardInBalls}
              value={rewardValue}
              onChange={(event) => setRewardValue(event.target.value)}
              placeholder={`Минимум ${minimalRewardInBalls.toLocaleString("ru-RU")}`}
              className="h-10 w-full rounded-[6px] border border-[#e4e4e4] bg-white p-3 text-[13px] font-medium leading-4 text-black outline-none placeholder:text-[#797979] focus:border-[#797979]"
              aria-label="Количество очков XP"
            />
          </div>
        ) : null}

        <div className="mt-3 flex gap-2">
          {actionMode === "idle" ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={SECONDARY_BUTTON_CLASS}
                onClick={() => setActionMode("reject")}
                disabled={isPending}
              >
                Отклонить
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-7 rounded-[6px] bg-[#2563eb] px-2 text-[13px] font-medium leading-4 text-white shadow-none hover:bg-[#2563eb]/90"
                onClick={() =>
                  isPublicationReview ? setActionMode("approve") : onApprove(submission)
                }
                disabled={isPending}
              >
                Принять
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={SECONDARY_BUTTON_CLASS}
                onClick={() => setActionMode("idle")}
                disabled={isPending}
              >
                Отмена
              </Button>
              {actionMode === "reject" ? (
                <Button
                  type="button"
                  size="sm"
                  className="h-7 rounded-[6px] bg-[#ff0000] px-2 text-[13px] font-medium leading-4 text-white shadow-none hover:bg-[#ff0000]/90 disabled:bg-[#ff0000] disabled:opacity-100"
                  onClick={() => onReject(submission, reviewComment.trim())}
                  disabled={isPending || !reviewComment.trim()}
                >
                  Отправить
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="h-7 rounded-[6px] bg-[#26c464] px-2 text-[13px] font-medium leading-4 text-white shadow-none hover:bg-[#26c464]/90 disabled:bg-[#26c464] disabled:opacity-100"
                  onClick={() => onApprove(submission, parsedReward)}
                  disabled={isPending || !rewardIsValid}
                >
                  Начислить XP
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SubmissionStatusLogDialog({
  open,
  submission,
  minimalRewardInBalls,
  onClose,
  onApprove,
  onReject,
  isPending,
  reviewDisabled = false,
  errorMessage,
}: SubmissionStatusLogDialogProps) {
  const [actionMode, setActionMode] = useState<ActionMode>("idle");
  const [reviewComment, setReviewComment] = useState("");
  const [rewardValue, setRewardValue] = useState("");

  useEffect(() => {
    setActionMode("idle");
    setReviewComment("");
    setRewardValue("");
  }, [open, reviewDisabled, submission?.id, submission?.status]);

  const events = [...(submission?.events ?? [])].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
  return (
    <DialogRoot
      open={open}
      onOpenChange={(next) => {
        if (!next && !isPending) onClose();
      }}
    >
      <DialogContent
        data-task-status-log-dialog
        showCloseButton={false}
        className="w-[min(358px,calc(100vw-2rem))] self-start gap-0 overflow-hidden rounded-[8px] border-0 bg-white p-0 shadow-none sm:max-w-[358px]"
      >
        <DialogHeader className="h-11 flex-row items-center gap-4 space-y-0 px-4 py-2.5">
          <DialogTitle className="flex-1 text-left text-[15px] font-medium leading-5 tracking-[-0.135px] text-black">
            Статус задания
          </DialogTitle>
          <DialogDescription className="sr-only">
            Хронология изменений и текущий этап проверки задания
          </DialogDescription>
          <button
            type="button"
            className="flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
            onClick={onClose}
            disabled={isPending}
            aria-label="Закрыть"
          >
            <img src={closeIcon} alt="" width={14} height={14} className="size-[13px]" />
          </button>
        </DialogHeader>

        <div className="max-h-[calc(100dvh-90px)] overflow-y-auto px-4 py-4">
          {submission ? (
            <div className="relative space-y-4">
              <img
                src={timelineUrl}
                alt=""
                width={2}
                height={332}
                className="pointer-events-none absolute bottom-2.5 left-[9px] top-2.5 h-[calc(100%-20px)] w-[1.5px] max-w-none"
              />
              {events.map((event) => (
                <EventRow key={event.id} event={event} rewardValue={submission.rewardValue} />
              ))}
              <div className="relative flex items-start gap-3">
                <StatusIcon src={pencilRulerIcon} />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[13px] font-medium leading-4 text-[#797979]">Ответ исполнителя</p>
                  <SubmissionContentPreview submission={submission} />
                  {events.length > 0 && <p className="pt-2 text-xs leading-4 text-[#797979]">Текущая версия материалов. Исторические версии API не возвращает.</p>}
                </div>
              </div>
              {errorMessage && <Alert variant="destructive" role="alert"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
              <ReviewStep
                submission={submission}
                minimalRewardInBalls={minimalRewardInBalls}
                actionMode={actionMode}
                setActionMode={setActionMode}
                reviewComment={reviewComment}
                setReviewComment={setReviewComment}
                rewardValue={rewardValue}
                setRewardValue={setRewardValue}
                onApprove={onApprove}
                onReject={onReject}
                isPending={isPending}
                reviewDisabled={reviewDisabled}
              />
            </div>
          ) : (
            <p className="text-[13px] font-medium leading-4 text-[#797979]">
              История задания пока пуста
            </p>
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
