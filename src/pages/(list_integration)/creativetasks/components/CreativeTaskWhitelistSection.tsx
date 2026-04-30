import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  InputField,
  PageLoader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@senler/ui";
import { useCreativeTaskWhitelist } from "@/hooks/creativetasks/useCreativeTaskWhitelist";
import { useAddToCreativeTaskWhitelist } from "@/hooks/creativetasks/useAddToCreativeTaskWhitelist";
import { useRemoveFromCreativeTaskWhitelist } from "@/hooks/creativetasks/useRemoveFromCreativeTaskWhitelist";
import { useUpdateCreativeTask } from "@/hooks/creativetasks/useUpdateCreativeTask";
import { useAmbassadors } from "@/hooks/ambassador/useAmbassadors";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useCreateInvitation } from "@/hooks/invitations/useCreateInvitation";
import { useDeleteInvitation } from "@/hooks/invitations/useDeleteInvitation";
import { useRoomInvitations } from "@/hooks/invitations/useRoomInvitations";
import { getFirstFieldError } from "@services/config/axios.helper";
import { CreativesPaginationControls } from "./CreativesPaginationControls";
import type { ICreativeTask } from "@services/creativetasks/creativetasks.types";
import type { IAmbassador } from "@services/ambassador/ambassador.types";
import {
  INVITATION_CHANNEL_TYPE_VK,
  type IInvitation,
} from "@services/invitations/invitations.types";
import { resolveVkProfileId } from "@/utils/vkProfile";

const NONE = "__none__";

type TaskInvitationRow =
  | {
      type: "whitelist";
      key: string;
      ambassadorId: string;
      promoCode: string;
    }
  | {
      type: "registration";
      key: string;
      invitation: IInvitation;
      subscriberIds: string[];
    };

interface CreativeTaskWhitelistSectionProps {
  task: ICreativeTask;
}

function getOptionLabel(a: IAmbassador) {
  return a.promoCode || "Без промокода";
}

export function CreativeTaskWhitelistSection({ task }: CreativeTaskWhitelistSectionProps) {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedAmbassadorId, setSelectedAmbassadorId] = useState(NONE);
  const [searchQuery, setSearchQuery] = useState("");
  const [vkProfileUrl, setVkProfileUrl] = useState("");
  const [vkInvitationError, setVkInvitationError] = useState("");
  const [isResolvingVk, setIsResolvingVk] = useState(false);

  const { room } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";

  const { items, isLoading, pagination } = useCreativeTaskWhitelist(task.id, {
    page,
    size: pageSize,
  });
  const {
    invitations,
    isLoading: isLoadingInvitations,
    isError: isInvitationsError,
    error: invitationsError,
  } = useRoomInvitations(roomId);

  const {
    addToWhitelist,
    isPending: isAdding,
    generalError: addGeneralError,
    validationErrors: addValidationErrors,
  } = useAddToCreativeTaskWhitelist();

  const {
    removeFromWhitelist,
    isPending: isRemoving,
    generalError: removeGeneralError,
  } = useRemoveFromCreativeTaskWhitelist();

  const {
    deleteInvitation,
    isPending: isDeletingInvitation,
    generalError: deleteInvitationError,
    reset: resetDeleteInvitation,
  } = useDeleteInvitation();

  const {
    updateCreativeTask,
    isPending: isUpdatingTask,
    generalError: updateTaskError,
  } = useUpdateCreativeTask();

  const {
    createInvitation,
    isPending: isCreatingInvitation,
    generalError: createInvitationError,
    validationErrors: createInvitationValidationErrors,
    reset: resetCreateInvitation,
  } = useCreateInvitation();

  const {
    ambassadors,
    isLoading: isLoadingAmbassadors,
  } = useAmbassadors({
    page: 1,
    size: 100,
    roomIds: room?.id ? ([room.id] as unknown as number[]) : undefined,
  });

  const ambassadorOptions = useMemo(
    () => (ambassadors ?? []).filter((a) => !!a.promoCode?.trim()),
    [ambassadors]
  );

  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return ambassadorOptions;
    const q = searchQuery.toLowerCase().trim();
    return ambassadorOptions.filter((a) => a.promoCode?.toLowerCase().includes(q));
  }, [ambassadorOptions, searchQuery]);

  const promoByAmbassadorId = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of ambassadorOptions) {
      if (a.id) m.set(a.id, a.promoCode);
    }
    return m;
  }, [ambassadorOptions]);

  const taskInvitations = useMemo(() => {
    return invitations
      .filter((inv) => inv.taskIds?.includes(task.id))
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [invitations, task.id]);

  const combinedRows = useMemo<TaskInvitationRow[]>(() => {
    const whitelistRows: TaskInvitationRow[] = items.map((row) => ({
      type: "whitelist",
      key: `whitelist-${row.ambassadorId}`,
      ambassadorId: row.ambassadorId,
      promoCode:
        row.promoCode?.trim() ||
        promoByAmbassadorId.get(row.ambassadorId) ||
        "—",
    }));

    const registrationRows: TaskInvitationRow[] = taskInvitations.map((inv) => ({
      type: "registration",
      key: `invitation-${inv.id}`,
      invitation: inv,
      subscriberIds: (inv.targets ?? [])
        .map((target) => target.subscriberId)
        .filter(Boolean),
    }));

    return [...whitelistRows, ...registrationRows];
  }, [items, promoByAmbassadorId, taskInvitations]);

  const handleAddSelected = () => {
    if (selectedAmbassadorId === NONE) return;
    addToWhitelist({
      taskId: task.id,
      data: { ambassadorId: selectedAmbassadorId },
    });
    setSelectedAmbassadorId(NONE);
    setSearchQuery("");
  };

  const handleRemove = (ambassadorId: string) => {
    removeFromWhitelist({ taskId: task.id, ambassadorId });
  };

  const handleDeleteRegistrationInvitation = (invitation: IInvitation) => {
    if (!roomId) return;

    deleteInvitation(
      { id: invitation.id, roomId },
      {
        onSuccess: () => {
          resetDeleteInvitation();
        },
      }
    );
  };

  const whitelistDisabled = task.isWhitelistEnabled === false;
  const invitationTargetError =
    getFirstFieldError(createInvitationValidationErrors, "targets") ||
    getFirstFieldError(createInvitationValidationErrors, "subscriberId");
  const invitationError =
    vkInvitationError || createInvitationError || invitationTargetError;
  const isInvitationPending = isResolvingVk || isCreatingInvitation;

  const handleWhitelistEnabledChange = (enabled: boolean) => {
    updateCreativeTask({
      id: task.id,
      data: {
        title: task.title,
        description: task.description,
        startsAt: task.startsAt,
        endsAt: task.endsAt,
        isDeleted: task.isDeleted,
        isWhitelistEnabled: enabled,
      },
    });
  };

  const handleCreateInvitation = async () => {
    if (!room?.id || !vkProfileUrl.trim()) return;

    setVkInvitationError("");
    setIsResolvingVk(true);

    try {
      const subscriberId = await resolveVkProfileId(vkProfileUrl);

      createInvitation(
        {
          roomId: room.id,
          targets: [
            {
              channelTypeId: INVITATION_CHANNEL_TYPE_VK,
              subscriberId,
            },
          ],
          taskIds: [task.id],
          eventIds: [],
        },
        {
          onSuccess: () => {
            setVkProfileUrl("");
            resetCreateInvitation();
          },
        }
      );
    } catch (error) {
      setVkInvitationError(
        error instanceof Error
          ? error.message
          : "Не удалось получить id профиля VK."
      );
    } finally {
      setIsResolvingVk(false);
    }
  };

  return (
    <Card className="mt-6 border border-border bg-card shadow-sm">
      <CardContent className="space-y-3 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Приглашения в задачу</h2>
            <p className="text-sm text-muted-foreground">
              Вайтлист ограничивает участие уже зарегистрированных амбассадоров, а
              приглашение по VK-ссылке добавляет задачу пользователю после регистрации.
            </p>
          </div>
          <Button
            type="button"
            variant={whitelistDisabled ? "default" : "outline"}
            size="lg"
            className="shrink-0"
            onClick={() => handleWhitelistEnabledChange(whitelistDisabled)}
            disabled={isUpdatingTask}
          >
            {isUpdatingTask
              ? "Сохранение…"
              : whitelistDisabled
                ? "Активировать вайтлист"
                : "Деактивировать вайтлист"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Только приглашённые амбассадоры могут участвовать в задаче, если включены
          приглашения в настройках задачи.
        </p>

        {whitelistDisabled ? (
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <AlertDescription>
              Приглашения для этой задачи отключены. Включите «Приглашения в задачу» в настройках
              задачи при редактировании.
            </AlertDescription>
          </Alert>
        ) : null}

        {(addGeneralError || removeGeneralError || updateTaskError || deleteInvitationError) && (
          <Alert variant="destructive">
            <AlertDescription>
              {addGeneralError || removeGeneralError || updateTaskError || deleteInvitationError}
            </AlertDescription>
          </Alert>
        )}

        {isInvitationsError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {(invitationsError as Error)?.message ?? "Не удалось загрузить приглашения после регистрации"}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {room?.id ? (
            <div className="grid gap-2 rounded-md border border-border p-3">
              <p className="text-sm font-medium text-foreground">
                1. Добавить существующего амбассадора в вайтлист
              </p>
              <p className="text-sm text-muted-foreground">
                Используется роут /creative-tasks/{task.id}/whitelist. Поиск только по промокоду.
              </p>
              {isLoadingAmbassadors ? (
                <p className="text-sm text-muted-foreground">Загрузка списка…</p>
              ) : null}
              <InputField
                className="w-full min-w-0"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedAmbassadorId(NONE);
                }}
                disabled={whitelistDisabled || isLoadingAmbassadors}
                placeholder="Промокод"
                aria-label="Поиск амбассадора по промокоду"
              />
              <Select
                value={selectedAmbassadorId}
                onValueChange={setSelectedAmbassadorId}
                disabled={whitelistDisabled || isLoadingAmbassadors}
              >
                <SelectTrigger className="h-10 w-full" aria-label="Амбассадор по промокоду">
                  <SelectValue placeholder="Выберите промокод" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>—</SelectItem>
                  {filteredBySearch.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {getOptionLabel(a)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-10 w-full"
                onClick={handleAddSelected}
                disabled={
                  whitelistDisabled || isLoadingAmbassadors || isAdding || selectedAmbassadorId === NONE
                }
              >
                Добавить в вайтлист
              </Button>
              {addValidationErrors?.ambassadorId?.[0] ? (
                <p className="text-sm text-destructive">
                  {addValidationErrors.ambassadorId[0]}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-2 rounded-md border border-border p-3">
            <p className="text-sm font-medium text-foreground">
              2. Создать приглашение после регистрации
            </p>
            <p className="text-sm text-muted-foreground">
              Используется роут /invitations. Вставьте ссылку на профиль VK, задача подставится
              автоматически.
            </p>
            <InputField
              className="w-full min-w-0"
              value={vkProfileUrl}
              onChange={(e) => {
                setVkProfileUrl(e.target.value);
                setVkInvitationError("");
              }}
              error={!!invitationError}
              helperText={
                invitationError ||
                "Например: https://vk.com/username"
              }
              placeholder="https://vk.com/username"
              aria-label="Ссылка на профиль VK"
            />
            <Button
              type="button"
              size="lg"
              className="h-10 w-full"
              onClick={() => void handleCreateInvitation()}
              disabled={isInvitationPending || !vkProfileUrl.trim() || !room?.id}
            >
              {isInvitationPending ? "Создание…" : "Создать приглашение"}
            </Button>
          </div>
        </div>

        {isLoading || isLoadingInvitations ? (
          <div className="flex justify-center py-8">
            <PageLoader label="Загрузка…" />
          </div>
        ) : combinedRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Приглашённых пока нет.</p>
        ) : (
          <>
            <ul className="space-y-2" aria-label="Приглашения в задачу">
              {combinedRows.map((row) => {
                if (row.type === "registration") {
                  const subscriberLabel = row.subscriberIds.length
                    ? row.subscriberIds.join(", ")
                    : "—";

                  return (
                    <li
                      key={row.key}
                      className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 py-2 pl-3 pr-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm text-muted-foreground">Источник:</span>
                          <Badge variant="outline" className="text-xs sm:text-sm">
                            После регистрации
                          </Badge>
                        </div>
                        <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                          VK ID: {subscriberLabel}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Создано: {new Date(row.invitation.createdAt).toLocaleString("ru-RU")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteRegistrationInvitation(row.invitation)}
                        disabled={isDeletingInvitation}
                        aria-label="Удалить приглашение после регистрации"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  );
                }

                return (
                  <li
                    key={row.key}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 py-2 pl-3 pr-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm text-muted-foreground">Источник:</span>
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          Вайтлист
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <span className="text-sm text-muted-foreground">Промокод:</span>
                        <Badge variant="secondary" className="font-mono text-xs sm:text-sm">
                          {row.promoCode}
                        </Badge>
                      </div>
                      <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                        ID: {row.ambassadorId}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(row.ambassadorId)}
                      disabled={whitelistDisabled || isRemoving}
                      aria-label="Удалить приглашение"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>

            {pagination && pagination.totalPages > 1 ? (
              <CreativesPaginationControls
                page={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                className="pt-2"
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
