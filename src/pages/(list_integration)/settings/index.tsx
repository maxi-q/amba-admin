import { useParams } from "react-router-dom";
import { Box, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useUpdateRoom } from "@/hooks/rooms/useUpdateRoom";
import { useDeleteRoom } from "@/hooks/rooms/useDeleteRoom";
import { useRotateSecretKey } from "@/hooks/rooms/useRotateSecretKey";
import { SettingsLoadingState } from "./components/SettingsLoadingState";
import { SettingsErrorState } from "./components/SettingsErrorState";
import { SettingsNotFoundState } from "./components/SettingsNotFoundState";
import { RoomNameSection } from "./components/RoomNameSection";
import { RoomActionButtons } from "./components/RoomActionButtons";
import { WebhookSection } from "./components/WebhookSection";
import { FormForSiteSection } from "./components/FormForSiteSection";
import { DeleteRoomDialog } from "./components/DeleteRoomDialog";
import { SettingsNotifications } from "./components/SettingsNotifications";

export default function SettingPage() {
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
    deleteRoom,
    isPending: isDeleting,
    isValidationError: isDeleteValidationError,
    validationErrors: deleteValidationErrors,
    generalError: deleteGeneralError
  } = useDeleteRoom();

  const {
    rotateSecretKey,
    isPending: isRotating,
    isValidationError: isRotateValidationError,
    validationErrors: rotateValidationErrors,
    generalError: rotateGeneralError
  } = useRotateSecretKey();

  const [roomName, setRoomName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>('');

  useEffect(() => {
    if (room) {
      setRoomName(room.name || '');
      setWebhookUrl(room.webhookUrl || '');
      setSecretKey(room.secretKey || '');
    }
  }, [room]);

  useEffect(() => {
    if (isUpdateValidationError && Object.keys(updateValidationErrors).length > 0) {
      setFieldErrors(updateValidationErrors);
      setGeneralError('');
    } else if (isDeleteValidationError && Object.keys(deleteValidationErrors).length > 0) {
      setFieldErrors(deleteValidationErrors);
      setGeneralError('');
    } else if (isRotateValidationError && Object.keys(rotateValidationErrors).length > 0) {
      setFieldErrors(rotateValidationErrors);
      setGeneralError('');
    } else if (updateGeneralError) {
      setGeneralError(updateGeneralError);
      setFieldErrors({});
    } else if (deleteGeneralError) {
      setGeneralError(deleteGeneralError);
      setFieldErrors({});
    } else if (rotateGeneralError) {
      setGeneralError(rotateGeneralError);
      setFieldErrors({});
    } else {
      setFieldErrors({});
      setGeneralError('');
    }
  }, [isUpdateValidationError, updateValidationErrors, updateGeneralError, isDeleteValidationError, deleteValidationErrors, deleteGeneralError, isRotateValidationError, rotateValidationErrors, rotateGeneralError]);

  useEffect(() => {
    if (isUpdateSuccess) {
      setShowSaveNotification(true);
    }
  }, [isUpdateSuccess]);

  const handleSaveName = () => {
    if (!slug) return;

    setFieldErrors({});
    setGeneralError('');

    updateRoom({
      data: { name: roomName },
      id: slug
    });
  };

  const handleSaveWebhook = () => {
    if (!slug) return;

    setFieldErrors({});
    setGeneralError('');

    updateRoom({
      data: { webhookUrl },
      id: slug
    });
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    if (!slug) return;

    setFieldErrors({});
    setGeneralError('');

    deleteRoom(slug);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyNotification(true);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
    }
  };

  const handleCopySecretKey = () => {
    handleCopyToClipboard(secretKey || '');
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

      <RoomNameSection
        roomName={roomName}
        onChange={setRoomName}
        fieldErrors={fieldErrors}
      />

      <RoomActionButtons
        onSave={handleSaveName}
        onDelete={handleDelete}
        isUpdating={isUpdating || isDeleting}
      />

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

      <FormForSiteSection
        roomId={room.id}
        onCopy={handleCopyToClipboard}
      />

      <DeleteRoomDialog
        open={showDeleteDialog}
        roomName={room.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isUpdating={isDeleting}
      />

      <SettingsNotifications
        showSaveSuccess={showSaveNotification}
        showCopySuccess={showCopyNotification}
        onCloseSaveSuccess={() => setShowSaveNotification(false)}
        onCloseCopySuccess={() => setShowCopyNotification(false)}
      />
    </Box>
  );
}
