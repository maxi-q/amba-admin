import { useEffect, useRef, useState } from "react";
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
import type {
  BaseSprintDto,
  CreateRewardRuleRequestDto,
  CreateSprintRequestDto,
  CreativeTaskWithDefaultsDto,
  UpdateSprintRequestDto,
} from "@/api/generated/model";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import {
  dateToInput,
  emptySprintFormData,
  sprintToFormData,
  type SprintFormData,
} from "./helpers";
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
import { useSprintRewardRuleActions } from "@/hooks/sprints/useSprintRewardRuleActions";
import { useSprintTaskActions } from "@/hooks/sprints/useSprintTaskActions";
import { useSprintTaskLoader } from "@/hooks/sprints/useSprintTaskLoader";
import { saveSprintWithRelations, type SprintSaveProgress } from "./saveSprintWithRelations";

const formDateToIso = (value: string | null): string | null => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const SprintSetting = () => {
  const { sprintId, slug } = useParams();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Маршрут `sprints/new` не объявляет `:sprintId`, поэтому смотрим и path
  const isNewSprint =
    sprintId === "new" || /\/sprints\/new\/?$/.test(pathname);
  const isEditSprint =
    !isNewSprint && /\/sprints\/[^/]+\/edit\/?$/.test(pathname);

  const {
    createSprint,
    createSprintAsync,
    isPending: isCreating,
    isValidationError: isCreateValidationError,
    validationErrors: createValidationErrors,
    generalError: createGeneralError,
  } = useCreateSprint();

  const {
    patchSprint,
    patchSprintAsync,
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
    slug || "",
    { allPages: true }
  );
  const {
    rules: existingRewardRules,
    isLoading: isLoadingRewardRules,
    isError: isRewardRulesError,
  } = useSprintRewardRules(isEditSprint ? sprintId ?? "" : "");
  const { createRuleAsync, updateRuleAsync, deleteRuleAsync } =
    useSprintRewardRuleActions();
  const { createTaskAsync, updateTaskAsync } = useSprintTaskActions();
  const loadTask = useSprintTaskLoader();
  const {
    tasks: roomTasks,
    isLoading: isLoadingRoomTasks,
    isError: isRoomTasksError,
  } = useRoomCreativeTasks(isEditSprint ? roomId : "", {
    page: 1,
    size: 100,
  }, { allPages: true });

  const [sprint, setSprint] = useState<BaseSprintDto | null>(null);
  const [description, setDescription] = useState("");
  const [creationStep, setCreationStep] = useState<1 | 2 | 3>(
    isEditSprint && new URLSearchParams(search).get("step") === "tasks" ? 3 : 1
  );
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
  } | null>(null);
  const [editHydrationError, setEditHydrationError] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const saveProgress = useRef<SprintSaveProgress>({ ruleIds: {}, taskIds: {} });
  const savingRef = useRef(false);
  const leavingRef = useRef(false);
  const hydratedSprintId = useRef<string | null>(null);
  const [allowLeave, setAllowLeave] = useState(false);

  const shouldBlockLeave =
    (isNewSprint || isEditSprint) &&
    !allowLeave;
  const leaveBlocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldBlockLeave && !leavingRef.current && currentLocation.pathname !== nextLocation.pathname
  );
  const [formData, setFormData] = useState<SprintFormData>(
    emptySprintFormData
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>("");

  useEffect(() => {
    if (sprintId !== "new" && sprints.length > 0) {
      const foundSprint = sprints.find((s) => s.id === sprintId);
      if (foundSprint) {
        setSprint(foundSprint);
        if (hydratedSprintId.current !== foundSprint.id) {
          hydratedSprintId.current = foundSprint.id;
          setDescription(foundSprint.description ?? "");
          setFormData(sprintToFormData(foundSprint));
        }
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
    void Promise.all(sprintTasks.map((task) => loadTask(task.id))).then((detailedTasks) => {
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
            ordForm: (task.ordForm ?? "") as DraftSprintTask["ordForm"],
            ordKktus: [...(task.ordKktus ?? [])],
            ordContractTemplateId: task.ordContractTemplateId ?? "",
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
      saveProgress.current = {
        sprintId: sprint.id,
        ruleIds: Object.fromEntries(existingRewardRules.map((rule) => [
          rule.type === "byPoints" ? "proportional" : rule.type === "manual" ? "manual" : rule.id,
          rule.id,
        ])),
        taskIds: Object.fromEntries(sprintTasks.map((task) => [task.id, task.id])),
      };
      setEditBaseline({ sprintId: sprint.id });
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
    loadTask,
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

  const buildSprintPayload = (
    isDraft?: boolean
  ): UpdateSprintRequestDto => ({
    name: formData.name.trim() || null,
    description: description.trim() || null,
    startDate: formDateToIso(formData.startDate),
    endDate: formData.ignoreEndDate
      ? null
      : formDateToIso(formData.endDate),
    ignoreEndDate: formData.ignoreEndDate,
    rewardType: formData.rewardType,
    rewardUnits: formData.rewardUnits.trim() || null,
    rewardValue: Number.isFinite(formData.rewardValue)
      ? formData.rewardValue
      : null,
    promoCodeUsageLimit: Number.isFinite(formData.promoCodeUsageLimit)
      ? formData.promoCodeUsageLimit
      : null,
    ignorePromoCodeUsageLimit: formData.ignorePromoCodeUsageLimit,
    ...(isDraft === undefined ? {} : { isDraft }),
  });

  const hasSprintContent = Boolean(
    formData.name.trim() ||
      description.trim() ||
      formData.startDate ||
      formData.endDate ||
      formData.rewardUnits.trim() ||
      Number.isFinite(formData.rewardValue) ||
      Number.isFinite(formData.promoCodeUsageLimit) ||
      formData.ignoreEndDate ||
      formData.ignorePromoCodeUsageLimit
  );

  const handleSave = () => {
    setFieldErrors({});
    setGeneralError("");
    const storeData = buildSprintPayload();

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
        isDraft: false,
      };
      createSprint(createData, {
        onSuccess: (createdSprint) => {
          toast.success("Спринт успешно создан");
          navigate(`/rooms/${slug}/sprints/${createdSprint.id}`);
        },
      });
    }
  };

  const handleInputChange =
    (field: keyof SprintFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      const updatedData = {
        ...formData,
        [field]:
          (field === "rewardValue" || field === "promoCodeUsageLimit") &&
          newValue === ""
            ? Number.NaN
            : field === "rewardValue" || field === "promoCodeUsageLimit"
              ? Number(newValue)
              : newValue,
      };
      setFormData(updatedData);
    };

  const handleSelectChange =
    (field: keyof SprintFormData) =>
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
    if (!Number.isFinite(formData.rewardValue) || formData.rewardValue < 1) {
      errors.rewardValue = ["Значение награды должно быть не меньше 1"];
    }
    if (!formData.rewardUnits.trim()) {
      errors.rewardUnits = ["Выберите единицы награды"];
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

  const handleStayOnPage = () => {
    if (leaveBlocker.state === "blocked") {
      leaveBlocker.reset();
    }
  };

  const handleLeaveWithoutSaving = () => {
    if (savingRef.current) return;
    leavingRef.current = true;
    if (leaveBlocker.state === "blocked") {
      leaveBlocker.proceed();
      return;
    }
    setAllowLeave(true);
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
      key: string;
      data: CreateRewardRuleRequestDto;
    }> = draftRankRules
      .filter((rule) => rule.rewards.length > 0)
      .map((rule) => ({
        key: rule.id,
        data: {
          type: "byRank",
          rankFrom: rule.rankFrom,
          rankTo: rule.rankTo,
          minPoints: null,
          rewards: rule.rewards,
        },
      }));

    if (draftProportional.rewards.length > 0) {
      rules.push({
        key: "proportional",
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
        key: "manual",
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

  const saveWizard = async (data: UpdateSprintRequestDto, publish: boolean) => {
    const targetRoomId = roomId || sprint?.roomId || slug || "";
    try {
      return await saveSprintWithRelations({
        progress: saveProgress.current,
        roomId: targetRoomId,
        data,
        publish,
        rules: buildRewardRules(),
        tasks: draftTasks.map((task) => ({
          key: task.id,
          createData: draftTaskToCreatePayload(task, targetRoomId, ""),
          updateData: draftTaskToUpdatePayload(task, ""),
        })),
        actions: {
          createSprint: createSprintAsync,
          updateSprint: patchSprintAsync,
          createRule: createRuleAsync,
          updateRule: updateRuleAsync,
          deleteRule: deleteRuleAsync,
          createTask: createTaskAsync,
          updateTask: updateTaskAsync,
        },
      });
    } finally {
      // A partial save is real server state too; keep IDs and refresh every affected view.
      setDraftTasks((tasks) => tasks.map((task) => saveProgress.current.taskIds[task.id]
        ? { ...task, isPersisted: true }
        : task));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QueryKeys.SPRINTS, targetRoomId] }),
        queryClient.invalidateQueries({ queryKey: [QueryKeys.CREATIVE_TASKS, targetRoomId] }),
        queryClient.invalidateQueries({ queryKey: [QueryKeys.SPRINT_REWARD_RULES, saveProgress.current.sprintId] }),
        queryClient.invalidateQueries({ queryKey: [QueryKeys.SPRINT_LEADERBOARD] }),
      ]);
    }
  };

  const handleDraftClick = async (leaveAfterSave = false) => {
    if (!slug || savingRef.current) return;

    const keepAsDraft = !sprint || sprint.isDraft;
    savingRef.current = true;
    setIsSavingDraft(true);
    setGeneralError("");

    try {
      await saveWizard(hasSprintContent ? buildSprintPayload() : {}, false);
      toast.success(keepAsDraft ? "Черновик сохранён" : "Спринт сохранён");
      leavingRef.current = true;
      setAllowLeave(true);
      if (leaveAfterSave && leaveBlocker.state === "blocked") {
        leaveBlocker.proceed();
      } else {
        navigate(`/rooms/${slug}/sprints`);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : keepAsDraft
            ? "Не удалось сохранить черновик"
            : "Не удалось сохранить спринт";
      setGeneralError(message);
      toast.error(message);
    } finally {
      savingRef.current = false;
      setIsSavingDraft(false);
    }
  };

  const handleSaveDraftAndLeave = () => {
    void handleDraftClick(true);
  };

  const handleLaunchSprint = async () => {
    if (!slug || draftTasks.length === 0 || savingRef.current) return;

    const publicationErrors: Record<string, string[]> = {};
    if (!formData.name.trim()) {
      publicationErrors.name = ["Укажите название спринта"];
    }
    if (!formData.startDate) {
      publicationErrors.startDate = ["Выберите дату начала"];
    }
    if (!Number.isFinite(formData.rewardValue) || formData.rewardValue < 1) {
      publicationErrors.rewardValue = [
        "Значение награды должно быть не меньше 1",
      ];
    }
    if (!formData.rewardUnits.trim()) {
      publicationErrors.rewardUnits = ["Выберите единицы награды"];
    }
    if (!formData.ignoreEndDate && !formData.endDate) {
      publicationErrors.endDate = ["Выберите дату окончания"];
    }
    if (Object.keys(publicationErrors).length > 0) {
      setFieldErrors(publicationErrors);
      setCreationStep(1);
      return;
    }

    const taskWithoutOrdForm = draftTasks.find((task) => !task.ordForm);
    if (taskWithoutOrdForm) {
      const message = `Выберите форму распространения в задании «${taskWithoutOrdForm.title}»`;
      setGeneralError(message);
      toast.error(message);
      return;
    }

    const startDate =
      isEditSprint &&
      sprint?.startDate &&
      dateToInput(sprint.startDate) === formData.startDate
        ? sprint.startDate
        : formDateToIso(formData.startDate);
    const endDate = formData.ignoreEndDate
      ? null
      : formData.endDate
        ? isEditSprint &&
          sprint?.endDate &&
          dateToInput(sprint.endDate) === formData.endDate
          ? sprint.endDate
          : formDateToIso(formData.endDate)
        : null;

    savingRef.current = true;
    setIsLaunching(true);
    setGeneralError("");

    try {
      const sprintData: UpdateSprintRequestDto = {
        ...buildSprintPayload(),
        startDate,
        endDate,
      };

      const savedSprint = await saveWizard(sprintData, true);

      toast.success(
        isEditSprint && !sprint?.isDraft
          ? "Спринт сохранён"
          : "Спринт запущен"
      );
      leavingRef.current = true;
      setAllowLeave(true);
      navigate(`/rooms/${slug}/sprints/${savedSprint.id}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isEditSprint
            ? "Не удалось сохранить спринт"
            : "Не удалось запустить спринт";
      setGeneralError(message);
      toast.error(message);
    } finally {
      savingRef.current = false;
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
      <div className="flex min-h-full w-full flex-col py-6" inert={isLaunching || isSavingDraft} aria-busy={isLaunching || isSavingDraft}>
        <SprintUnsavedLeaveDialog
          open={leaveBlocker.state === "blocked"}
          onStay={handleStayOnPage}
          onLeaveWithoutSaving={handleLeaveWithoutSaving}
          onSaveDraft={handleSaveDraftAndLeave}
          isSaving={isLaunching || isSavingDraft}
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
            isSaving={isCreating || isUpdating || isSavingDraft || isLaunching}
            onNameChange={handleInputChange("name")}
            onRewardValueChange={handleInputChange("rewardValue")}
            onRewardUnitsChange={(value) =>
              handleSelectChange("rewardUnits")({ target: { value } })
            }
            onDescriptionChange={setDescription}
            onDateRangeChange={handleDateRangeChange}
            onSaveDraft={() => {
              void handleDraftClick();
            }}
            onContinue={handleCreationStepOneContinue}
          />
        ) : null}
        {creationStep === 2 ? (
          <SprintCreationStepTwo
            roomId={roomId}
            roomSlug={slug ?? ""}
            pinnedRewards={existingRewardRules.flatMap((rule) => rule.rewards.map((item) => item.reward))}
            rankRules={draftRankRules}
            proportional={draftProportional}
            manualRewards={draftManualRewards}
            onRankRulesChange={setDraftRankRules}
            onProportionalChange={setDraftProportional}
            onManualRewardsChange={setDraftManualRewards}
            onBack={() => setCreationStep(1)}
            onContinue={() => setCreationStep(3)}
            onSaveDraft={() => {
              void handleDraftClick();
            }}
          />
        ) : null}
        {creationStep === 3 ? (
          <SprintCreationStepThree
            roomId={roomId}
            roomSlug={slug ?? ""}
            tasks={draftTasks}
            isLaunching={isLaunching || isSavingDraft}
            onTasksChange={setDraftTasks}
            onBack={() => setCreationStep(2)}
            onLaunch={() => {
              void handleLaunchSprint();
            }}
            submitLabel={
              isEditSprint && !sprint?.isDraft
                ? "Сохранить спринт"
                : undefined
            }
            onSaveDraft={() => {
              void handleDraftClick();
            }}
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
        sprintName={sprint?.name ?? undefined}
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
