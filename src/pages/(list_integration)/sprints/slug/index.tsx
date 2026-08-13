import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useBlocker,
  useLocation,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Alert, AlertDescription, PageLoader } from "@senler/ui";
import { useCreateSprint } from "@/hooks/sprints/useCreateSprint";
import { usePatchSprint } from "@/hooks/sprints/usePatchSprint";
import { useSprints } from "@/hooks/sprints/useSprints";
import { creativeTasksControllerCreateCreativeTask } from "@/api/generated/creative-tasks/creative-tasks";
import {
  sprintsControllerCreate,
  sprintsControllerCreateRewardRule,
} from "@/api/generated/sprints/sprints";
import type {
  BaseSprintDto,
  CreateSprintRequestDto,
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
import { DeleteSprintDialog } from "./components/DeleteSprintDialog";
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
import { draftTaskToCreatePayload } from "./components/draftSprintTask";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";

const SprintSetting = () => {
  const { sprintId, slug } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Маршрут `sprints/new` не объявляет `:sprintId`, поэтому смотрим и path
  const isNewSprint =
    sprintId === "new" || /\/sprints\/new\/?$/.test(pathname);

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

  const { room } = useGetRoomById(slug || "");
  const roomId = room?.id ?? slug ?? "";

  const { sprints, isLoading: isLoadingSprints } = useSprints(
    { page: 1, size: 100 },
    slug || ""
  );

  const [sprint, setSprint] = useState<BaseSprintDto | null>(null);
  const [description, setDescription] = useState("");
  const [creationStep, setCreationStep] = useState<1 | 2 | 3>(1);
  const [rewardMode, setRewardMode] = useState<SprintRewardMode>("rating");
  const [draftRankRules, setDraftRankRules] = useState<DraftRankRule[]>([]);
  const [draftProportional, setDraftProportional] =
    useState<DraftProportionalReward>({
      amount: "",
      rankTo: "",
    });
  const [draftManualRewards, setDraftManualRewards] = useState<
    DraftManualReward[]
  >([]);
  const [draftTasks, setDraftTasks] = useState<DraftSprintTask[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [allowLeave, setAllowLeave] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const shouldBlockLeave = isNewSprint && !allowLeave && !isLaunching;
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
    isDeleted: false,
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
          isDeleted: foundSprint.isDeleted,
        });
      }
    }
  }, [sprintId, sprints]);

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

  const handleSave = (isDeletedFlag: boolean = false) => {
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
      isDeleted: isDeletedFlag,
    };

    if (isDeletedFlag && !isNewSprint) {
      setFormData((prev) => ({ ...prev, isDeleted: true }));
    }

    if (!isNewSprint) {
      patchSprint(
        { data: storeData, sprintId: sprintId || "" },
        {
          onSuccess: (_, variables) => {
            if (variables.data.isDeleted) {
              navigate(`/rooms/${slug}/sprints`);
            } else {
              toast.success("Спринт успешно сохранён");
              navigate(`/rooms/${slug}/sprints/${sprintId}`);
            }
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

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    handleSave(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
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
    if (!formData.endDate) {
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

  const handleLaunchSprint = async () => {
    if (!slug || draftTasks.length === 0) return;

    const targetRoomId = room?.id || roomId || slug;
    const startDate = (
      formData.startDate ? new Date(formData.startDate) : new Date()
    ).toISOString();
    const endDate = formData.endDate
      ? new Date(formData.endDate).toISOString()
      : null;

    setIsLaunching(true);
    setGeneralError("");

    try {
      const createData: CreateSprintRequestDto = {
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
        isDeleted: false,
        roomId: targetRoomId,
      };

      const createdSprint = await sprintsControllerCreate(createData);

      if (rewardMode === "rating") {
        for (const rule of draftRankRules) {
          if (rule.rewards.length === 0) continue;
          await sprintsControllerCreateRewardRule(createdSprint.id, {
            type: "byRank",
            rankFrom: rule.rankFrom,
            rankTo: rule.rankTo,
            minPoints: null,
            rewards: rule.rewards.map((reward) => ({
              rewardId: reward.rewardId,
              amount: reward.amount,
            })),
          });
        }
      } else if (rewardMode === "manual" && draftManualRewards.length > 0) {
        await sprintsControllerCreateRewardRule(createdSprint.id, {
          type: "manual",
          rankFrom: null,
          rankTo: null,
          minPoints: null,
          rewards: draftManualRewards.map((reward) => ({
            rewardId: reward.rewardId,
            amount: reward.amount,
          })),
        });
      }

      for (const task of draftTasks) {
        await creativeTasksControllerCreateCreativeTask(
          draftTaskToCreatePayload(
            task,
            targetRoomId,
            createdSprint.id,
            startDate,
            endDate
          )
        );
      }

      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.SPRINTS, createdSprint.roomId],
      });
      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.CREATIVE_TASKS, targetRoomId],
        exact: false,
      });

      toast.success("Спринт запущен");
      setAllowLeave(true);
      navigate(`/rooms/${slug}/sprints/${createdSprint.id}`);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Не удалось запустить спринт";
      setGeneralError(message);
      toast.error(message);
    } finally {
      setIsLaunching(false);
    }
  };

  if (isLoadingSprints) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (!isNewSprint && sprints.length > 0 && !sprint) {
    return <SprintNotFoundState />;
  }

  if (isNewSprint) {
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
            disabled={formData.isDeleted}
          />
        </div>

        <SprintActionButtons
          isNewSprint={isNewSprint}
          onSave={() => handleSave()}
          onDelete={handleDelete}
          isCreating={isCreating}
          isUpdating={isUpdating}
        />
      </div>

      <DeleteSprintDialog
        open={showDeleteDialog}
        sprintName={sprint?.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default SprintSetting;
