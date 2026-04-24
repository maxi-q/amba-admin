import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEvents } from "@/hooks/events/useEvents";
import { useCreateEvent } from "@/hooks/events/useCreateEvent";
import { usePatchEvent } from "@/hooks/events/usePatchEvent";
import { useCheckPromoCodesPrefixAvailable } from "@/hooks/events/useCheckPromoCodesPrefixAvailable";
import { useGetProject } from "@/hooks/projects/useGetProject";
import { Alert, AlertDescription, PageLoader } from "@senler/ui";
import type { IEvent, IPatchEventsRequest } from "@services/events/events.types";
import { dateToInput } from "./helpers";
import { EventPageHeader } from "./components/EventPageHeader";
import { EventSettingsSection } from "./components/EventSettingsSection";
import { PromoCodesSection } from "./components/PromoCodesSection";
import { SubscriberGroupsSection } from "./components/SubscriberGroupsSection";
import { EventActionButtons } from "./components/EventActionButtons";
import { DeleteEventDialog } from "./components/DeleteEventDialog";
import { EventErrorState } from "./components/EventErrorState";
import { EventNotFoundState } from "./components/EventNotFoundState";

const EventsSetting = () => {
  const { eventId, slug } = useParams();
  const navigate = useNavigate();
  const isNewEvent = eventId === "new";

  const {
    events: eventData,
    isLoading: isLoadingEvents,
    isError: isEventsError,
    error: eventsError
  } = useEvents(
    { page: 1, size: 100 },
    slug || ""
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [prefixValidationError, setPrefixValidationError] = useState<string>("");
  const [prefixOccupiedError, setPrefixOccupiedError] = useState<string>("");
  const [formData, setFormData] = useState<IPatchEventsRequest>({
    name: "",
    description: "",
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
  const [prefix, setPrefix] = useState<string>("");

  useEffect(() => {
    if (eventData && !isNewEvent) {
      const foundEvent = eventData.find((e) => e.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
        setFormData({
          name: foundEvent.name,
          description: foundEvent.description ?? "",
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
      description: formData.description,
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

    if (isDeleted && !isNewEvent) {
      setFormData((prev) => ({ ...prev, isDeleted: true }));
    }

    if (isNewEvent && !isDeleted) {
      if (prefixValidationError) {
        return;
      }

      checkPrefixAvailable(prefix, {
        onSuccess: (isAvailable) => {
          if (isAvailable === false) {
            setPrefixOccupiedError("Префикс уже занят");
            toast.error(
              `Префикс «${prefix}» уже занят. Пожалуйста, выберите другой префикс.`
            );
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
        eventId: eventId || ""
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

  const handleInputChange =
    (field: keyof IPatchEventsRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const updatedData = {
        ...formData,
        [field]:
          field === "rewardValue" || field === "promoCodeUsageLimit"
            ? Number(newValue)
            : newValue
      };
      setFormData(updatedData);
    };

  const handleRewardUnitsChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rewardUnits: value }));
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setPrefixOccupiedError("");

    if (value.includes("_")) {
      setPrefixValidationError("Префикс не может содержать символ подчеркивания (_)");
    } else {
      setPrefixValidationError("");
    }

    setPrefix(value);
  };

  const handleCopyEventId = async () => {
    try {
      await navigator.clipboard.writeText(
        `ID события:${eventId || "Ошибка получения ID события"}`
      );
      toast.success("Скопировано");
    } catch (error) {
      console.error("Ошибка при копировании:", error);
      toast.error(
        `Браузер запретил копирование, но вы можете сделать это вручную: ${eventId ?? ""}`
      );
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
      <div className="flex min-h-dvh w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
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

  if (!isNewEvent && eventData && !event) {
    return <EventNotFoundState />;
  }

  return (
    <div className="w-full px-2 py-6">
      {(createGeneralError || updateGeneralError || checkPrefixGeneralError) ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {createGeneralError || updateGeneralError || checkPrefixGeneralError}
          </AlertDescription>
        </Alert>
      ) : null}

      <EventPageHeader onCopyEventId={handleCopyEventId} />

      <div>
        <h2 className="mb-4 text-lg font-bold tracking-tight">Настройки</h2>
        <div className="flex flex-col gap-6">
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

          <PromoCodesSection
            formData={formData}
            onInputChange={handleInputChange}
            onRewardUnitsChange={handleRewardUnitsChange}
            createValidationErrors={createValidationErrors}
            updateValidationErrors={updateValidationErrors}
            onIgnorePromoCodeUsageLimitChange={handleIgnorePromoCodeUsageLimitChange}
          />
        </div>

        <EventActionButtons
          isNewEvent={isNewEvent}
          onSave={() => void handleSave()}
          onDelete={handleDelete}
          isCreating={isCreating}
          isUpdating={isUpdating}
          isCheckingPrefix={isCheckingPrefix}
        />
      </div>

      {!isNewEvent && event ? (
        <SubscriberGroupsSection
          event={event}
          channelExternalId={project?.channelExternalId}
        />
      ) : null}

      <DeleteEventDialog
        open={showDeleteDialog}
        eventName={event?.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default EventsSetting;
