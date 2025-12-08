import { useParams } from "react-router-dom";
import { Box, Alert, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useUpdateRoom } from "@/hooks/rooms/useUpdateRoom";
import { useRotateSecretKey } from "@/hooks/rooms/useRotateSecretKey";
import { SettingsLoadingState } from "../settings/components/SettingsLoadingState";
import { SettingsErrorState } from "../settings/components/SettingsErrorState";
import { SettingsNotFoundState } from "../settings/components/SettingsNotFoundState";
import { WebhookSection } from "../settings/components/WebhookSection";

export default function CodePage() {
  const { slug } = useParams();

  const {
    room,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError
  } = useGetRoomById(slug || '');

  const {
    updateRoom,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
    isValidationError: isUpdateValidationError,
    validationErrors: updateValidationErrors,
    generalError: updateGeneralError
  } = useUpdateRoom();

  const {
    rotateSecretKey,
    isPending: isRotating,
    isValidationError: isRotateValidationError,
    validationErrors: rotateValidationErrors,
    generalError: rotateGeneralError
  } = useRotateSecretKey();

  const [webhookUrl, setWebhookUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>('');

  useEffect(() => {
    if (room) {
      setWebhookUrl(room.webhookUrl || '');
      setSecretKey(room.secretKey || '');
    }
  }, [room]);

  useEffect(() => {
    if (isUpdateValidationError && Object.keys(updateValidationErrors).length > 0) {
      setFieldErrors(updateValidationErrors);
      setGeneralError('');
    } else if (isRotateValidationError && Object.keys(rotateValidationErrors).length > 0) {
      setFieldErrors(rotateValidationErrors);
      setGeneralError('');
    } else if (updateGeneralError) {
      setGeneralError(updateGeneralError);
      setFieldErrors({});
    } else if (rotateGeneralError) {
      setGeneralError(rotateGeneralError);
      setFieldErrors({});
    } else {
      setFieldErrors({});
      setGeneralError('');
    }
  }, [isUpdateValidationError, updateValidationErrors, updateGeneralError, isRotateValidationError, rotateValidationErrors, rotateGeneralError]);

  useEffect(() => {
    if (isUpdateSuccess) {
      setShowSaveNotification(true);
    }
  }, [isUpdateSuccess]);

  const handleSaveWebhook = () => {
    if (!slug) return;

    setFieldErrors({});
    setGeneralError('');

    updateRoom({
      data: { webhookUrl },
      id: slug
    });
  };

  const handleCopySecretKey = async () => {
    try {
      await navigator.clipboard.writeText(secretKey || '');
      setShowCopyNotification(true);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
    }
  };

  const generateSecretKey = () => {
    if (!slug) return;

    setFieldErrors({});
    setGeneralError('');

    rotateSecretKey(slug);
  };

  if (isLoadingRoom) {
    return <SettingsLoadingState />;
  }

  if (isRoomError) {
    return <SettingsErrorState errorMessage={roomError?.message} />;
  }

  if (!room) {
    return <SettingsNotFoundState />;
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      {generalError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {generalError}
        </Alert>
      )}

      <WebhookSection
        webhookUrl={webhookUrl}
        secretKey={secretKey}
        slug={slug}
        fieldErrors={fieldErrors}
        isUpdating={isUpdating}
        isRotating={isRotating}
        onWebhookUrlChange={setWebhookUrl}
        onSaveWebhook={handleSaveWebhook}
        onCopySecretKey={handleCopySecretKey}
        onRotateSecretKey={generateSecretKey}
      />

      <Snackbar
        open={showSaveNotification}
        autoHideDuration={3000}
        onClose={() => setShowSaveNotification(false)}
        message="Изменения сохранены"
      />

      <Snackbar
        open={showCopyNotification}
        autoHideDuration={3000}
        onClose={() => setShowCopyNotification(false)}
        message="Скопировано в буфер обмена"
      />
    </Box>
  );
}
