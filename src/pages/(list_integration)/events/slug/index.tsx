import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Paper, Stack, Alert, Typography } from "@mui/material";
import { useEvents } from "@/hooks/events/useEvents";
import { useCreateEvent } from "@/hooks/events/useCreateEvent";
import { usePatchEvent } from "@/hooks/events/usePatchEvent";
import { useCheckPromoCodesPrefixAvailable } from "@/hooks/events/useCheckPromoCodesPrefixAvailable";
import { useGetProject } from "@/hooks/projects/useGetProject";
import { Loader } from "@/components/Loader";
import type { IEvent, IPatchEventsRequest } from "@services/events/events.types";
import { dateToInput } from "./helpers";
import { EventPageHeader } from "./components/EventPageHeader";
import { EventSettingsSection } from "./components/EventSettingsSection";
import { PromoCodesSection } from "./components/PromoCodesSection";
import { SubscriberGroupsSection } from "./components/SubscriberGroupsSection";
import { EventActionButtons } from "./components/EventActionButtons";
import { DeleteEventDialog } from "./components/DeleteEventDialog";
import { EventNotifications } from "./components/EventNotifications";
import { EventErrorState } from "./components/EventErrorState";
import { EventNotFoundState } from "./components/EventNotFoundState";

const EventsSetting = () => {
  const { eventId, slug } = useParams();
  const navigate = useNavigate();
  const isNewEvent = eventId === 'new';

  const {
    events: eventData,
    isLoading: isLoadingEvents,
    isError: isEventsError,
    error: eventsError
  } = useEvents(
    { page: 1, size: 100 },
    slug || ''
  );

  const {
    project,
    isLoading: isLoadingProject,
    isError: isProjectError,
    error: projectError
  } = useGetProject();

  const {
    mutate: createEvent,
    isPending: isCreating,
    validationErrors: createValidationErrors,
    generalError: createGeneralError
  } = useCreateEvent();

  const {
    mutate: patchEvent,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
    validationErrors: updateValidationErrors,
    generalError: updateGeneralError
  } = usePatchEvent();

  const {
    mutate: checkPrefixAvailable,
    isPending: isCheckingPrefix,
    validationErrors: checkPrefixValidationErrors,
    generalError: checkPrefixGeneralError
  } = useCheckPromoCodesPrefixAvailable();

  const [event, setEvent] = useState<IEvent>();
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showCopyError, setShowCopyError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrefixError, setShowPrefixError] = useState(false);
  const [prefixValidationError, setPrefixValidationError] = useState<string>('');
  const [prefixOccupiedError, setPrefixOccupiedError] = useState<string>('');
  const [formData, setFormData] = useState<IPatchEventsRequest>({
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
  const [prefix, setPrefix] = useState<string>('');

  useEffect(() => {
    if (eventData && !isNewEvent) {
      const foundEvent = eventData.find(event => event.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
        setFormData({
          name: foundEvent.name,
          startDate: dateToInput(foundEvent.startDate),
          endDate: dateToInput(foundEvent.endDate),
          ignoreEndDate: foundEvent.ignoreEndDate,
          rewardType: foundEvent.rewardType,
          rewardUnits: foundEvent.rewardUnits,
          rewardValue: foundEvent.rewardValue,
          promoCodeUsageLimit: foundEvent.promoCodeUsageLimit,
          ignorePromoCodeUsageLimit: foundEvent.ignorePromoCodeUsageLimit,
          isDeleted: foundEvent.isDeleted,
        });
        setPrefix(foundEvent.name);
      }
    }
  }, [eventId, eventData, isNewEvent]);

  useEffect(() => {
    if (isUpdateSuccess && formData.isDeleted) {
      navigate(`/rooms/${slug}/events`);
    }
  }, [isUpdateSuccess, formData.isDeleted, slug, navigate]);

  const handleSave = async (isDeleted: boolean = false) => {
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

    if (isNewEvent && !isDeleted) {
      if (prefixValidationError) {
        return;
      }

      checkPrefixAvailable(prefix, {
        onSuccess: (isAvailable) => {
          if (isAvailable === false) {
            setPrefixOccupiedError('Префикс уже занят');
            setShowPrefixError(true);
            return;
          }

          if (slug) {
            createEvent({
              ...storeData,
              roomId: slug,
              promoCodesPrefix: prefix
            });
          }
        },
      });
    } else if (!isNewEvent) {
      patchEvent({
        data: storeData,
        eventId: eventId || ''
      });
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    await handleSave(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleInputChange = (field: keyof IPatchEventsRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const updatedData = {
      ...formData,
      [field]: field === 'rewardValue' || field === 'promoCodeUsageLimit' ? Number(newValue) : newValue
    };
    setFormData(updatedData);
  };

  const handleSelectChange = (field: keyof IPatchEventsRequest) => (event: any) => {
    const newValue = event.target.value;
    const updatedData = {
      ...formData,
      [field]: newValue
    };
    setFormData(updatedData);
  };

  const handlePrefixChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setPrefixOccupiedError('');

    if (value.includes('_')) {
      setPrefixValidationError('Префикс не может содержать символ подчеркивания (_)');
    } else {
      setPrefixValidationError('');
    }

    setPrefix(value);
  };

  const handleCopyEventId = async () => {
    try {
      await navigator.clipboard.writeText(`ID события:${eventId || 'Ошибка получения ID события'}`);
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

  if (isLoadingEvents || isLoadingProject) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Loader />
      </Box>
    );
  }

  if (isEventsError || isProjectError) {
    return (
      <EventErrorState
        eventsError={eventsError?.message}
        projectError={projectError?.message}
      />
    );
  }

  if (!event && !isNewEvent) {
    return <EventNotFoundState />;
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <EventPageHeader
        eventName={event?.name}
        onCopyEventId={handleCopyEventId}
      />

      <Stack spacing={4}>
        {(createGeneralError || updateGeneralError || checkPrefixGeneralError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {createGeneralError || updateGeneralError || checkPrefixGeneralError}
          </Alert>
        )}

        <Paper elevation={0} sx={{ borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Настройки
          </Typography>

          <EventSettingsSection
            formData={formData}
            prefix={prefix}
            onInputChange={handleInputChange}
            onPrefixChange={handlePrefixChange}
            createValidationErrors={createValidationErrors}
            updateValidationErrors={updateValidationErrors}
            prefixValidationError={prefixValidationError}
            prefixOccupiedError={prefixOccupiedError}
            checkPrefixValidationErrors={checkPrefixValidationErrors}
            isNewEvent={isNewEvent}
            onIgnoreEndDateChange={handleIgnoreEndDateChange}
          />
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: 2 }}>
          <PromoCodesSection
            formData={formData}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            createValidationErrors={createValidationErrors}
            updateValidationErrors={updateValidationErrors}
            onIgnorePromoCodeUsageLimitChange={handleIgnorePromoCodeUsageLimitChange}
          />
        </Paper>

        <EventActionButtons
          isNewEvent={isNewEvent}
          onSave={() => handleSave()}
          onDelete={handleDelete}
          isCreating={isCreating}
          isUpdating={isUpdating}
          isCheckingPrefix={isCheckingPrefix}
        />

        {!isNewEvent && event && (
          <SubscriberGroupsSection
            event={event}
            channelExternalId={project?.channelExternalId}
          />
        )}
      </Stack>

      <EventNotifications
        showCopySuccess={showCopyNotification}
        showCopyError={showCopyError}
        showPrefixError={showPrefixError}
        eventId={eventId}
        prefix={prefix}
        onCloseCopySuccess={() => setShowCopyNotification(false)}
        onCloseCopyError={() => setShowCopyError(false)}
        onClosePrefixError={() => setShowPrefixError(false)}
      />

      <DeleteEventDialog
        open={showDeleteDialog}
        eventName={event?.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  );
};

export default EventsSetting;
