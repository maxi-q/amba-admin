import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useBlocker,
  useLocation,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Alert, AlertDescription, Button, PageLoader } from "@senler/ui";
import { useCreateSprint } from "@/hooks/sprints/useCreateSprint";
import { usePatchSprint } from "@/hooks/sprints/usePatchSprint";
import { useSprints } from "@/hooks/sprints/useSprints";
import {
  creativeTasksControllerCreateCreativeTask,
  creativeTasksControllerGetCreativeTaskById,
  creativeTasksControllerUpdateCreativeTask,
} from "@/api/generated/creative-tasks/creative-tasks";
import {
  sprintsControllerCreate,
  sprintsControllerCreateRewardRule,
  sprintsControllerDeleteRewardRule,
  sprintsControllerUpdate,
  sprintsControllerUpdateRewardRule,
} from "@/api/generated/sprints/sprints";
import type {
  BaseSprintDto,
  CreateRewardRuleRequestDto,
  CreateSprintRequestDto,
  CreativeTaskWithDefaultsDto,
  UpdateSprintRequestDto,
} from "@/api/generated/model";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { ApiError } from "@/types";
import { dateToInput } from "./helpers";
import { SprintPageHeader } from "./components/SprintPageHeader";
import { SprintSettingsSection } from "./components/SprintSettingsSection";
import { SprintPromoCodesSection } from "./components/SprintPromoCodesSection";
import { SprintRewardRulesSection } from "./components/SprintRewardRulesSection";
import { SprintActionButtons } from "./components/SprintActionButtons";
import { SprintNotFoundState } from "./components/SprintNotFoundState";
import { SprintCreationStepOne } from "./components/SprintCreationStepOne";
import {
  SprintCreationStepTwo,
  type DraftManualReward,
  type DraftProportionalReward,
  type DraftRankRule,
  type SprintRewardMode,
} from "./components/SprintCreationStepTwo";
import { SprintCreationStepThree } from "./components/SprintCreationStepThree";
import { SprintUnsavedLeaveDialog } from "./components/SprintUnsavedLeaveDialog";
import type { DraftSprintTask } from "./components/draftSprintTask";
import {
  draftTaskToCreatePayload,
  draftTaskToUpdatePayload,
} from "./components/draftSprintTask";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useSprintRewardRules } from "@/hooks/sprints/useSprintRewardRules";

const SprintSetting = () => {
  const { sprintId, slug } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Маршрут `sprints/new` не объявляет `:sprintId`, поэтому смотрим и path
  const isNewSprint =
    sprintId === "new" || /\/sprints\/new\/?$/.test(pathname);
  const isEditSprint =
    !isNewSprint && /\/sprints\/[^/]+\/edit\/?$/.test(pathname);

  const {
    createSprint,
    isPending: isCreating,
    isValidationError: isCreateValidationError,
    validationErrors: createValidationErrors,
    generalError: createGeneralError,
  } = useCreateSprint();

  const {
    patchSprint,
    isPending: isUpdating,
    isValidationError: isUpdateValidationError,
    validationErrors: updateValidationErrors,
    generalError: updateGeneralError,
  } = usePatchSprint();

  const {
    room,
    isLoading: isLoadingRoom,
    isError: isRoomError,
  } = useGetRoomById(slug || "");
  const roomId = room?.id ?? "";

  const { sprints, isLoading: isLoadingSprints } = useSprints(
    { page: 1, size: 100 },
    slug || ""
  );
  const {
    rules: existingRewardRules,
    isLoading: isLoadingRewardRules,
    isError: isRewardRulesError,
  } = useSprintRewardRules(isEditSprint ? sprintId ?? "" : "");
  const {
    tasks: roomTasks,
    isLoading: isLoadingRoomTasks,
    isError: isRoomTasksError,
  } = useRoomCreativeTasks(isEditSprint ? roomId : "", {
    page: 1,
    size: 100,
  });

  const [sprint, setSprint] = useState<BaseSprintDto | null>(null);
  const [description, setDescription] = useState("");
  const [creationStep, setCreationStep] = useState<1 | 2 | 3>(1);
  const [rewardMode, setRewardMode] = useState<SprintRewardMode>("rating");
  const [draftRankRules, setDraftRankRules] = useState<DraftRankRule[]>([]);
  const [draftProportional, setDraftProportional] =
    useState<DraftProportionalReward>({
      amount: "",
      rankTo: "",
      minPoints: "",
      rewards: [],
    });
  const [draftManualRewards, setDraftManualRewards] = useState<
    DraftManualReward[]
  >([]);
  const [draftTasks, setDraftTasks] = useState<DraftSprintTask[]>([]);
  const [editBaseline, setEditBaseline] = useState<{
    sprintId: string;
    ruleIds: string[];
    taskIds: string[];
    proportionalRuleId?: string;
    manualRuleId?: string;
  } | null>(null);
  const [editHydrationError, setEditHydrationError] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);
  const [allowLeave, setAllowLeave] = useState(false);

  const shouldBlockLeave =
    (isNewSprint || isEditSprint) && !allowLeave && !isLaunching;
  const leaveBlocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldBlockLeave && currentLocation.pathname !== nextLocation.pathname
  );
  const [formData, setFormData] = useState<UpdateSprintRequestDto>({
    name: "",
    description: null,
    startDate: "",
    endDate: null,
    ignoreEndDate: false,
    rewardType: "fix",
    rewardUnits: "",
    rewardValue: 0,
    promoCodeUsageLimit: 0,
    ignorePromoCodeUsageLimit: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>("");

  useEffect(() => {
    if (sprintId !== "new" && sprints.length > 0) {
      const foundSprint = sprints.find((s) => s.id === sprintId);
      if (foundSprint) {
        setSprint(foundSprint);
        setDescription(foundSprint.description ?? "");
        setFormData({
          name: foundSprint.name,
          description: foundSprint.description ?? null,
          startDate: dateToInput(foundSprint.startDate) ?? "",
          endDate: foundSprint.endDate ? dateToInput(foundSprint.endDate) : null,
          ignoreEndDate: foundSprint.ignoreEndDate,
          rewardType: foundSprint.rewardType,
          rewardUnits: foundSprint.rewardUnits,
          rewardValue: foundSprint.rewardValue,
          promoCodeUsageLimit: foundSprint.promoCodeUsageLimit,
          ignorePromoCodeUsageLimit: foundSprint.ignorePromoCodeUsageLimit,
        });
      }
    }
  }, [sprintId, sprints]);

  useEffect(() => {
    if (
      !isEditSprint ||
      !sprint ||
      !roomId ||
      isLoadingRewardRules ||
      isLoadingRoomTasks ||
      isRewardRulesError ||
      isRoomTasksError ||
      editBaseline?.sprintId === sprint.id
    ) {
      return;
    }

    const proportionalRules = existingRewardRules.filter(
      (rule) => rule.type === "byPoints"
    );
    const manualRules = existingRewardRules.filter(
      (rule) => rule.type === "manual"
    );
    const hasInvalidRankRule = existingRewardRules.some(
      (rule) =>
        rule.type === "byRank" &&
        (rule.rankFrom == null || rule.rankTo == null)
    );
    if (
      hasInvalidRankRule ||
      proportionalRules.length > 1 ||
      manualRules.length > 1
    ) {
      setEditHydrationError(
        "Конфигурацию наград этого спринта нельзя безопасно открыть в редакторе"
      );
      return;
    }

    const rankRules = existingRewardRules
      .filter(
        (rule) =>
          rule.type === "byRank" &&
          rule.rankFrom != null &&
          rule.rankTo != null
      )
      .map((rule) => ({
        id: rule.id,
        rankFrom: rule.rankFrom as number,
        rankTo: rule.rankTo as number,
        rewards: rule.rewards.map((reward) => ({
          rewardId: reward.rewardId,
          amount: Number(reward.amount),
        })),
      }));
    const proportionalRule = proportionalRules[0];
    const manualRule = manualRules[0];
    const sprintTasks = roomTasks.filter(
      (task) => task.sprintId === sprint.id && !task.isDeleted
    );

    let cancelled = false;
    void Promise.all(
      sprintTasks.map((task) =>
        creativeTasksControllerGetCreativeTaskById(task.id)
      )
    ).then((detailedTasks) => {
      if (cancelled) return;

      setEditHydrationError("");
      setDraftRankRules(rankRules);
      setDraftProportional(
        proportionalRule
          ? {
              amount: String(
                proportionalRule.rewards.reduce(
                  (total, reward) => total + Number(reward.amount),
                  0
                )
              ),
              rankTo: String(proportionalRule.rankTo ?? ""),
              minPoints: String(proportionalRule.minPoints ?? ""),
              rewards: proportionalRule.rewards.map((reward) => ({
                rewardId: reward.rewardId,
                amount: Number(reward.amount),
              })),
            }
          : { amount: "", rankTo: "", minPoints: "", rewards: [] }
      );
      setDraftManualRewards(
        manualRule?.rewards.map((reward) => ({
          rewardId: reward.rewardId,
          amount: Number(reward.amount),
        })) ?? []
      );
      setDraftTasks(
        detailedTasks.map((task) => {
          const details = task as Partial<CreativeTaskWithDefaultsDto>;
          const defaultTargetUrls = details.defaultTargetUrls ?? [];
          const defaultTexts = details.defaultTexts ?? [];
          const defaultMediaIds = details.defaultMediaIds ?? [];

          return {
            id: task.id,
            isPersisted: true,
            title: task.title,
            description: task.description ?? "",
            prohibited: task.restrictions?.join("\n") ?? "",
            criteria: task.criteria?.length ? [...task.criteria] : [""],
            allowedFormats: (task.allowedFormats ?? []) as DraftSprintTask["allowedFormats"],
            targetPlatform: task.targetPlatform as DraftSprintTask["targetPlatform"],
            ordKktus: [...(task.ordKktus ?? [])],
            ordContractTemplateId: "",
            targetUrls: defaultTargetUrls.length ? [...defaultTargetUrls] : [""],
            allowAmbassadorTargetUrl: task.allowAmbassadorTargetUrl,
            defaultTexts: defaultTexts.length ? [...defaultTexts] : [""],
            allowAmbassadorText: task.allowAmbassadorText,
            defaultMediaIds: [...defaultMediaIds],
            allowAmbassadorMedia: task.allowAmbassadorMedia,
            publicationsCount: task.publicationsCount,
            requireMaterialsReview: task.requireMaterialsReview,
            requirePublicationReview: task.requirePublicationReview,
            minimalRewardInBalls: String(task.minimalRewardInBalls),
          };
        })
      );
      setEditBaseline({
        sprintId: sprint.id,
        ruleIds: existingRewardRules.map((rule) => rule.id),
        taskIds: sprintTasks.map((task) => task.id),
        proportionalRuleId: proportionalRule?.id,
        manualRuleId: manualRule?.id,
      });
    }).catch(() => {
      if (!cancelled) {
        setEditHydrationError(
          "Не удалось загрузить все данные заданий. Сохранение отключено, чтобы не потерять вложения"
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    editBaseline?.sprintId,
    existingRewardRules,
    isEditSprint,
    isLoadingRewardRules,
    isLoadingRoomTasks,
    isRewardRulesError,
    isRoomTasksError,
    roomTasks,
    roomId,
    sprint,
  ]);

  useEffect(() => {
    if (
      isCreateValidationError &&
      Object.keys(createValidationErrors).length > 0
    ) {
      setFieldErrors(createValidationErrors);
      setGeneralError("");
    } else if (
      isUpdateValidationError &&
      Object.keys(updateValidationErrors).length > 0
    ) {
      setFieldErrors(updateValidationErrors);
      setGeneralError("");
    } else if (createGeneralError) {
      setGeneralError(createGeneralError);
      setFieldErrors({});
    } else if (updateGeneralError) {
      setGeneralError(updateGeneralError);
      setFieldErrors({});
    } else {
      setFieldErrors({});
      setGeneralError("");
    }
  }, [
    isCreateValidationError,
    createValidationErrors,
    createGeneralError,
    isUpdateValidationError,
    updateValidationErrors,
    updateGeneralError,
  ]);

  const handleSave = () => {
    setFieldErrors({});
    setGeneralError("");

    const storeData = {
      name: formData.name,
      description: (description || formData.description || "").trim() || null,
      startDate: (
        formData.startDate ? new Date(formData.startDate) : new Date()
      ).toISOString(),
      endDate: dateToInput(formData.endDate),
      ignoreEndDate: formData.ignoreEndDate,
      rewardType: formData.rewardType,
      rewardUnits: formData.rewardUnits,
      rewardValue: formData.rewardValue,
      promoCodeUsageLimit: formData.promoCodeUsageLimit,
      ignorePromoCodeUsageLimit: formData.ignorePromoCodeUsageLimit,
    };

    if (!isNewSprint) {
      patchSprint(
        { data: storeData, sprintId: sprintId || "" },
        {
          onSuccess: () => {
            toast.success("Спринт успешно сохранён");
            navigate(`/rooms/${slug}/sprints/${sprintId}`);
          },
        }
      );
    } else if (slug) {
      const createData: CreateSprintRequestDto = {
        ...storeData,
        roomId: slug,
      };
      createSprint(createData, {
        onSuccess: () => {
          toast.success("Спринт успешно создан");
        },
      });
    }
  };

  const handleInputChange =
    (field: keyof UpdateSprintRequestDto) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      const updatedData = {
        ...formData,
        [field]:
          field === "rewardValue" || field === "promoCodeUsageLimit"
            ? Number(newValue)
            : newValue,
      };
      setFormData(updatedData);
    };

  const handleSelectChange =
    (field: keyof UpdateSprintRequestDto) =>
    (event: { target: { value: string } }) => {
      const newValue = event.target.value;
      setFormData({
        ...formData,
        [field]: newValue,
      });
    };

  const handleCopySprintId = async () => {
    try {
      await navigator.clipboard.writeText(
        `ID спринта:${sprintId ?? "Ошибка получения ID спринта"}`
      );
      toast.success("Скопировано");
    } catch (error) {
      console.error("Ошибка при копировании:", error);
      toast.error(
        `Браузер запретил копирование. ID: ${sprintId ?? ""}`
      );
    }
  };

  const handleIgnoreEndDateChange = (value: boolean) => {
    setFormData({
      ...formData,
      ignoreEndDate: value,
    });
  };

  const handleIgnorePromoCodeUsageLimitChange = (value: boolean) => {
    setFormData({
      ...formData,
      ignorePromoCodeUsageLimit: value,
    });
  };

  const handleDateRangeChange = (from?: Date, to?: Date) => {
    const toInputValue = (date?: Date) => {
      if (!date) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setFormData((previous) => ({
      ...previous,
      startDate: toInputValue(from) ?? "",
      endDate: toInputValue(to),
      ignoreEndDate: false,
    }));
  };

  const handleCreationStepOneContinue = () => {
    const errors: Record<string, string[]> = {};
    if (!formData.name.trim()) {
      errors.name = ["Укажите название спринта"];
    }
    if (!formData.startDate) {
      errors.startDate = ["Выберите дату начала"];
    }
    if (!formData.ignoreEndDate && !formData.endDate) {
      errors.endDate = ["Выберите дату окончания"];
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) {
      setCreationStep(2);
    }
  };

  const handleDraftClick = () => {
    // TODO: подключить сохранение черновика после появления draft-статуса/endpoint на backend.
    toast.message("Сохранение черновика будет доступно позже");
  };

  const handleStayOnPage = () => {
    if (leaveBlocker.state === "blocked") {
      leaveBlocker.reset();
    }
  };

  const handleLeaveWithoutSaving = () => {
    if (leaveBlocker.state === "blocked") {
      leaveBlocker.proceed();
      return;
    }
    setAllowLeave(true);
  };

  const handleSaveDraftAndLeave = () => {
    handleDraftClick();
  };

  useEffect(() => {
    if (!shouldBlockLeave) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [shouldBlockLeave]);

  const buildRewardRules = () => {
    const rules: Array<{
      id?: string;
      data: CreateRewardRuleRequestDto;
    }> = draftRankRules
      .filter((rule) => rule.rewards.length > 0)
      .map((rule) => ({
        id: editBaseline?.ruleIds.includes(rule.id) ? rule.id : undefined,
        data: {
          type: "byRank",
          rankFrom: rule.rankFrom,
          rankTo: rule.rankTo,
          minPoints: null,
          rewards: rule.rewards,
        },
      }));

    const hasProportionalFilter =
      Number(draftProportional.rankTo) > 0 ||
      (draftProportional.minPoints !== "" &&
        Number(draftProportional.minPoints) >= 0);
    if (draftProportional.rewards.length > 0 && hasProportionalFilter) {
      rules.push({
        id: editBaseline?.proportionalRuleId,
        data: {
          type: "byPoints",
          rankFrom: null,
          rankTo: draftProportional.rankTo
            ? Number(draftProportional.rankTo)
            : null,
          minPoints: draftProportional.minPoints
            ? Number(draftProportional.minPoints)
            : null,
          rewards: draftProportional.rewards,
        },
      });
    }

    if (draftManualRewards.length > 0) {
      rules.push({
        id: editBaseline?.manualRuleId,
        data: {
          type: "manual",
          rankFrom: null,
          rankTo: null,
          minPoints: null,
          rewards: draftManualRewards,
        },
      });
    }

    return rules;
  };

  const handleLaunchSprint = async () => {
    if (!slug || draftTasks.length === 0) return;

    const targetRoomId = roomId || sprint?.roomId || slug;
    const startDate =
      isEditSprint &&
      sprint?.startDate &&
      dateToInput(sprint.startDate) === formData.startDate
        ? sprint.startDate
        : new Date(
            formData.startDate
              ? `${formData.startDate}T00:00:00`
              : Date.now()
          ).toISOString();
    const endDate = formData.ignoreEndDate
      ? null
      : formData.endDate
        ? isEditSprint &&
          sprint?.endDate &&
          dateToInput(sprint.endDate) === formData.endDate
          ? sprint.endDate
          : new Date(`${formData.endDate}T00:00:00`).toISOString()
        : null;

    setIsLaunching(true);
    setGeneralError("");

    try {
      const sprintData: UpdateSprintRequestDto = {
        name: formData.name,
        description: description.trim() || null,
        startDate,
        endDate,
        ignoreEndDate: formData.ignoreEndDate,
        rewardType: formData.rewardType,
        rewardUnits: formData.rewardUnits,
        rewardValue: formData.rewardValue,
        promoCodeUsageLimit: formData.promoCodeUsageLimit,
        ignorePromoCodeUsageLimit: formData.ignorePromoCodeUsageLimit,
      };

      const savedSprint = isEditSprint && sprintId
        ? await sprintsControllerUpdate(sprintId, sprintData)
        : await sprintsControllerCreate({
            ...sprintData,
            roomId: targetRoomId,
          } as CreateSprintRequestDto);

      const rewardRules = buildRewardRules();
      for (const rule of rewardRules) {
        if (rule.id) {
          await sprintsControllerUpdateRewardRule(rule.id, rule.data);
        } else {
          await sprintsControllerCreateRewardRule(savedSprint.id, rule.data);
        }
      }

      if (isEditSprint && editBaseline) {
        const keptRuleIds = new Set(
          rewardRules.flatMap((rule) => (rule.id ? [rule.id] : []))
        );
        for (const ruleId of editBaseline.ruleIds) {
          if (!keptRuleIds.has(ruleId)) {
            await sprintsControllerDeleteRewardRule(ruleId);
          }
        }
      }

      const originalTaskIds = new Set(editBaseline?.taskIds ?? []);
      const keptTaskIds = new Set(
        draftTasks
          .filter((task) => originalTaskIds.has(task.id))
          .map((task) => task.id)
      );

      for (const task of draftTasks) {
        if (originalTaskIds.has(task.id)) {
          await creativeTasksControllerUpdateCreativeTask(
            task.id,
            draftTaskToUpdatePayload(task, savedSprint.id)
          );
        } else {
          await creativeTasksControllerCreateCreativeTask(
            draftTaskToCreatePayload(task, targetRoomId, savedSprint.id)
          );
        }
      }

      for (const taskId of originalTaskIds) {
        if (!keptTaskIds.has(taskId)) {
          await creativeTasksControllerUpdateCreativeTask(taskId, {
            isDeleted: true,
          });
        }
      }

      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.SPRINTS, savedSprint.roomId],
      });
      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.CREATIVE_TASKS, targetRoomId],
        exact: false,
      });
      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.SPRINT_REWARD_RULES, savedSprint.id],
      });
      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.SPRINT_LEADERBOARD],
        exact: false,
      });

      toast.success(isEditSprint ? "Спринт сохранён" : "Спринт запущен");
      setAllowLeave(true);
      navigate(`/rooms/${slug}/sprints/${savedSprint.id}`);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : isEditSprint
            ? "Не удалось сохранить спринт"
            : "Не удалось запустить спринт";
      setGeneralError(message);
      toast.error(message);
    } finally {
      setIsLaunching(false);
    }
  };

  if (isLoadingSprints || ((isNewSprint || isEditSprint) && isLoadingRoom)) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (!isNewSprint && !sprint) {
    return <SprintNotFoundState />;
  }

  if (
    isEditSprint &&
    (isRoomError || isRewardRulesError || isRoomTasksError || editHydrationError)
  ) {
    return (
      <div className="mx-auto flex min-h-[420px] w-full max-w-[700px] items-center px-4">
        <Alert variant="destructive">
          <AlertDescription className="space-y-3">
            <p>
              {editHydrationError ||
                "Не удалось загрузить данные спринта. Сохранение отключено, чтобы не потерять изменения"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Повторить
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (
    isEditSprint &&
    (isLoadingRewardRules || isLoadingRoomTasks || !editBaseline)
  ) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isNewSprint || isEditSprint) {
    return (
      <div className="flex min-h-full w-full flex-col py-6">
        <SprintUnsavedLeaveDialog
          open={leaveBlocker.state === "blocked"}
          onStay={handleStayOnPage}
          onLeaveWithoutSaving={handleLeaveWithoutSaving}
          onSaveDraft={handleSaveDraftAndLeave}
        />
        {generalError ? (
          <Alert variant="destructive" className="mx-auto mb-4 w-full max-w-[700px]">
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        ) : null}
        {creationStep === 1 ? (
          <SprintCreationStepOne
            formData={formData}
            description={description}
            fieldErrors={fieldErrors}
            isSaving={isCreating}
            onNameChange={handleInputChange("name")}
            onDescriptionChange={setDescription}
            onDateRangeChange={handleDateRangeChange}
            onSaveDraft={handleDraftClick}
            onContinue={handleCreationStepOneContinue}
          />
        ) : null}
        {creationStep === 2 ? (
          <SprintCreationStepTwo
            roomId={roomId}
            roomSlug={slug ?? ""}
            mode={rewardMode}
            rankRules={draftRankRules}
            proportional={draftProportional}
            manualRewards={draftManualRewards}
            onModeChange={setRewardMode}
            onRankRulesChange={setDraftRankRules}
            onProportionalChange={setDraftProportional}
            onManualRewardsChange={setDraftManualRewards}
            onBack={() => setCreationStep(1)}
            onContinue={() => setCreationStep(3)}
            onSaveDraft={handleDraftClick}
          />
        ) : null}
        {creationStep === 3 ? (
          <SprintCreationStepThree
            roomId={roomId}
            roomSlug={slug ?? ""}
            tasks={draftTasks}
            isLaunching={isLaunching}
            onTasksChange={setDraftTasks}
            onBack={() => setCreationStep(2)}
            onLaunch={() => {
              void handleLaunchSprint();
            }}
            submitLabel={isEditSprint ? "Сохранить спринт" : undefined}
            onSaveDraft={handleDraftClick}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="w-full px-2 py-6">
      {generalError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      ) : null}

      <SprintPageHeader
        sprintName={sprint?.name}
        onCopySprintId={handleCopySprintId}
      />

      <div>
        <h2 className="mb-4 text-lg font-bold tracking-tight">Настройки</h2>
        <div className="flex flex-col gap-6">
          <SprintSettingsSection
            formData={formData}
            onInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            onIgnoreEndDateChange={handleIgnoreEndDateChange}
            onDescriptionChange={(value) => {
              setDescription(value);
              setFormData((prev) => ({ ...prev, description: value || null }));
            }}
          />

          <SprintPromoCodesSection
            formData={formData}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            fieldErrors={fieldErrors}
            onIgnorePromoCodeUsageLimitChange={
              handleIgnorePromoCodeUsageLimitChange
            }
          />

          <SprintRewardRulesSection
            sprintId={sprintId || ""}
            roomId={roomId}
            roomSlug={slug || ""}
            disabled={sprint?.status !== "active"}
          />
        </div>

        <SprintActionButtons
          isNewSprint={isNewSprint}
          onSave={() => handleSave()}
          isCreating={isCreating}
          isUpdating={isUpdating}
        />
      </div>

    </div>
  );
};

export default SprintSetting;
