import { useParams, useLocation } from "react-router-dom";
import { Box, Alert } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useUpdateRoom } from "@/hooks/rooms/useUpdateRoom";
import { useDeleteRoom } from "@/hooks/rooms/useDeleteRoom";
import { SettingsLoadingState } from "./components/SettingsLoadingState";
import { SettingsErrorState } from "./components/SettingsErrorState";
import { SettingsNotFoundState } from "./components/SettingsNotFoundState";
import { RoomNameSection } from "./components/RoomNameSection";
import { RoomActionButtons } from "./components/RoomActionButtons";
import { DeleteRoomDialog } from "./components/DeleteRoomDialog";
import { SettingsNotifications } from "./components/SettingsNotifications";
import { SettingsBotsSection } from "./components/SettingsBotsSection";
import { SettingsWebhookSection } from "./components/SettingsWebhookSection";

export default function SettingPage() {
  const { slug } = useParams();
  const location = useLocation();
  const botsSectionRef = useRef<HTMLDivElement>(null);
  const webhookSectionRef = useRef<HTMLDivElement>(null);

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


  const [roomName, setRoomName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>('');

  useEffect(() => {
    if (room) {
      setRoomName(room.name || '');
    }
  }, [room]);

  useEffect(() => {
    if (isUpdateValidationError && Object.keys(updateValidationErrors).length > 0) {
      setFieldErrors(updateValidationErrors);
      setGeneralError('');
    } else if (isDeleteValidationError && Object.keys(deleteValidationErrors).length > 0) {
      setFieldErrors(deleteValidationErrors);
      setGeneralError('');
    } else if (updateGeneralError) {
      setGeneralError(updateGeneralError);
      setFieldErrors({});
    } else if (deleteGeneralError) {
      setGeneralError(deleteGeneralError);
      setFieldErrors({});
    } else {
      setFieldErrors({});
      setGeneralError('');
    }
  }, [isUpdateValidationError, updateValidationErrors, updateGeneralError, isDeleteValidationError, deleteValidationErrors, deleteGeneralError]);

  useEffect(() => {
    if (isUpdateSuccess) {
      setShowSaveNotification(true);
    }
  }, [isUpdateSuccess]);

  useEffect(() => {
    if (location.hash === "#bots" && botsSectionRef.current) {
      botsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (location.hash === "#webhook" && webhookSectionRef.current) {
      webhookSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  const handleSaveName = () => {
    if (!slug) return;

    setFieldErrors({});
    setGeneralError('');

    updateRoom({
      data: { name: roomName },
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

      <DeleteRoomDialog
        open={showDeleteDialog}
        roomName={room.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isUpdating={isDeleting}
      />

      <Box id="bots" ref={botsSectionRef}>
        <SettingsBotsSection
          slug={slug ?? ""}
          room={room}
          onSaveSuccess={() => setShowSaveNotification(true)}
        />
      </Box>

      <Box id="webhook" ref={webhookSectionRef}>
        <SettingsWebhookSection
          slug={slug ?? ""}
          room={room}
          onSaveSuccess={() => setShowSaveNotification(true)}
          onCopySuccess={() => setShowCopyNotification(true)}
        />
      </Box>

      <SettingsNotifications
        showSaveSuccess={showSaveNotification}
        showCopySuccess={showCopyNotification}
        onCloseSaveSuccess={() => setShowSaveNotification(false)}
        onCloseCopySuccess={() => setShowCopyNotification(false)}
      />
    </Box>
  );
}
