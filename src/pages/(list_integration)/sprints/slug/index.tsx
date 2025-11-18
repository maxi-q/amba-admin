import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Stack, Alert, Typography } from "@mui/material";
import { useCreateSprint } from "@/hooks/sprints/useCreateSprint";
import { usePatchSprint } from "@/hooks/sprints/usePatchSprint";
import { useSprints } from "@/hooks/sprints/useSprints";
import type { IPatchSprintsRequest, ICreateSprintRequest } from "@services/sprints/sprints.types";
import { dateToInput } from "./helpers";
import { Loader } from "@/components/Loader";
import { SprintPageHeader } from "./components/SprintPageHeader";
import { SprintSettingsSection } from "./components/SprintSettingsSection";
import { SprintPromoCodesSection } from "./components/SprintPromoCodesSection";
import { SprintActionButtons } from "./components/SprintActionButtons";
import { DeleteSprintDialog } from "./components/DeleteSprintDialog";
import { SprintNotifications } from "./components/SprintNotifications";
import { SprintNotFoundState } from "./components/SprintNotFoundState";

const SprintSetting = () => {
  const { sprintId, slug } = useParams();
  const navigate = useNavigate();
  const isNewSprint = sprintId === 'new';

  const {
    createSprint,
    isPending: isCreating,
    isSuccess: isCreateSuccess,
    isValidationError: isCreateValidationError,
    validationErrors: createValidationErrors,
    generalError: createGeneralError
  } = useCreateSprint();

  const {
    patchSprint,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
    isValidationError: isUpdateValidationError,
    validationErrors: updateValidationErrors,
    generalError: updateGeneralError
  } = usePatchSprint();

  const { sprints, isLoading: isLoadingSprints } = useSprints(
    { page: 1, size: 100 },
    slug || ''
  );

  const [sprint, setSprint] = useState<any>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showCopyError, setShowCopyError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [formData, setFormData] = useState<IPatchSprintsRequest>({
    name: '',
    startDate: null,
    endDate: null,
    ignoreEndDate: false,
    rewardType: 'fix',
    rewardUnits: '',
    rewardValue: 0,
    promoCodeUsageLimit: 0,
    ignorePromoCodeUsageLimit: false,
    isDeleted: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>('');

  useEffect(() => {
    if (sprintId !== 'new' && sprints.length > 0) {
      const foundSprint = sprints.find(sprint => sprint.id === sprintId);
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
    if (isCreateValidationError && Object.keys(createValidationErrors).length > 0) {
      setFieldErrors(createValidationErrors);
      setGeneralError('');
    } else if (isUpdateValidationError && Object.keys(updateValidationErrors).length > 0) {
      setFieldErrors(updateValidationErrors);
      setGeneralError('');
    } else if (createGeneralError) {
      setGeneralError(createGeneralError);
      setFieldErrors({});
    } else if (updateGeneralError) {
      setGeneralError(updateGeneralError);
      setFieldErrors({});
    } else {
      setFieldErrors({});
      setGeneralError('');
    }
  }, [isCreateValidationError, createValidationErrors, createGeneralError, isUpdateValidationError, updateValidationErrors, updateGeneralError]);

  useEffect(() => {
    if (isCreateSuccess) {
      setShowSaveNotification(true);
    }
  }, [isCreateSuccess]);

  useEffect(() => {
    if (isUpdateSuccess) {
      if (formData.isDeleted) {
        navigate(`/rooms/${slug}/sprints`);
      } else {
        setShowSaveNotification(true);
      }
    }
  }, [isUpdateSuccess, formData.isDeleted, slug, navigate]);

  const handleSave = (isDeleted: boolean = false) => {
    setFieldErrors({});
    setGeneralError('');

    const storeData = {
      name: formData.name,
      startDate: (formData.startDate ? new Date(formData.startDate) : new Date()).toISOString(),
      endDate: dateToInput(formData.endDate),
      ignoreEndDate: formData.ignoreEndDate,
      rewardType: formData.rewardType,
      rewardUnits: formData.rewardUnits,
      rewardValue: formData.rewardValue,
      promoCodeUsageLimit: formData.promoCodeUsageLimit,
      ignorePromoCodeUsageLimit: formData.ignorePromoCodeUsageLimit,
      isDeleted: isDeleted,
    };

    if (isDeleted && !isNewSprint) {
      setFormData(prev => ({ ...prev, isDeleted: true }));
    }

    if (!isNewSprint) {
      patchSprint({
        data: storeData,
        sprintId: sprintId || ''
      });
    } else if (slug) {
      const createData: ICreateSprintRequest = {
        ...storeData,
        roomId: slug
      };
      createSprint(createData);
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

  const handleInputChange = (field: keyof IPatchSprintsRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const updatedData = {
      ...formData,
      [field]: field === 'rewardValue' || field === 'promoCodeUsageLimit' ? Number(newValue) : newValue
    };
    setFormData(updatedData);
  };

  const handleSelectChange = (field: keyof IPatchSprintsRequest) => (event: any) => {
    const newValue = event.target.value;
    const updatedData = {
      ...formData,
      [field]: newValue
    };
    setFormData(updatedData);
  };

  const handleCopySprintId = async () => {
    try {
      await navigator.clipboard.writeText(`ID спринта:${sprintId || 'Ошибка получения ID спринта'}`);
      setShowCopyNotification(true);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
      setShowCopyError(true);
    }
  };

  const handleIgnoreEndDateChange = (value: boolean) => {
    setFormData({
      ...formData,
      ignoreEndDate: value
    });
  };

  const handleIgnorePromoCodeUsageLimitChange = (value: boolean) => {
    setFormData({
      ...formData,
      ignorePromoCodeUsageLimit: value
    });
  };

  if (isLoadingSprints) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </Box>
    );
  }

  if (!isNewSprint && sprints.length > 0 && !sprint) {
    return <SprintNotFoundState />;
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      {generalError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {generalError}
        </Alert>
      )}

      <SprintPageHeader
        sprintName={sprint?.name}
        onCopySprintId={handleCopySprintId}
      />

      <Box>
        <Typography variant="h6" fontWeight={700} mb={2}>Настройки</Typography>
        <Stack spacing={3}>
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
            onIgnorePromoCodeUsageLimitChange={handleIgnorePromoCodeUsageLimitChange}
          />
        </Stack>

        <SprintActionButtons
          isNewSprint={isNewSprint}
          onSave={() => handleSave()}
          onDelete={handleDelete}
          isCreating={isCreating}
          isUpdating={isUpdating}
        />
      </Box>

      <SprintNotifications
        showCopySuccess={showCopyNotification}
        showCopyError={showCopyError}
        showSaveSuccess={showSaveNotification}
        sprintId={sprintId}
        isNewSprint={isNewSprint}
        onCloseCopySuccess={() => setShowCopyNotification(false)}
        onCloseCopyError={() => setShowCopyError(false)}
        onCloseSaveSuccess={() => setShowSaveNotification(false)}
      />

      <DeleteSprintDialog
        open={showDeleteDialog}
        sprintName={sprint?.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isUpdating={isUpdating}
      />
    </Box>
  );
};

export default SprintSetting;
