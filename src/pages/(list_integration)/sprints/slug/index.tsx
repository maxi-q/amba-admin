import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, PageLoader } from "@senler/ui";
import { useCreateSprint } from "@/hooks/sprints/useCreateSprint";
import { usePatchSprint } from "@/hooks/sprints/usePatchSprint";
import { useSprints } from "@/hooks/sprints/useSprints";
import type {
  IPatchSprintsRequest,
  ICreateSprintRequest,
  ISprint,
} from "@services/sprints/sprints.types";
import { dateToInput } from "./helpers";
import { SprintPageHeader } from "./components/SprintPageHeader";
import { SprintSettingsSection } from "./components/SprintSettingsSection";
import { SprintPromoCodesSection } from "./components/SprintPromoCodesSection";
import { SprintActionButtons } from "./components/SprintActionButtons";
import { DeleteSprintDialog } from "./components/DeleteSprintDialog";
import { SprintNotFoundState } from "./components/SprintNotFoundState";

const SprintSetting = () => {
  const { sprintId, slug } = useParams();
  const navigate = useNavigate();
  const isNewSprint = sprintId === "new";

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

  const { sprints, isLoading: isLoadingSprints } = useSprints(
    { page: 1, size: 100 },
    slug || ""
  );

  const [sprint, setSprint] = useState<ISprint | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<IPatchSprintsRequest>({
    name: "",
    startDate: null,
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
        setFormData({
          name: foundSprint.name,
          startDate: dateToInput(foundSprint.startDate),
          endDate: dateToInput(foundSprint.endDate),
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
            }
          },
        }
      );
    } else if (slug) {
      const createData: ICreateSprintRequest = {
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
    (field: keyof IPatchSprintsRequest) =>
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
    (field: keyof IPatchSprintsRequest) =>
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
