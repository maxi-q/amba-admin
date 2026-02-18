import { Box, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { useUpdateRoom } from "@/hooks/rooms/useUpdateRoom";
import { useRotateSecretKey } from "@/hooks/rooms/useRotateSecretKey";
import { WebhookSection } from "./WebhookSection";
import type { IGetRoomByIdResponse } from "@services/rooms/rooms.types";

interface SettingsWebhookSectionProps {
  slug: string;
  room: IGetRoomByIdResponse | undefined;
  onSaveSuccess?: () => void;
  onCopySuccess?: () => void;
}

export function SettingsWebhookSection({
  slug,
  room,
  onSaveSuccess,
  onCopySuccess,
}: SettingsWebhookSectionProps) {
  const {
    updateRoom,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
    isValidationError: isUpdateValidationError,
    validationErrors: updateValidationErrors,
    generalError: updateGeneralError,
  } = useUpdateRoom();

  const {
    rotateSecretKey,
    isPending: isRotating,
    isValidationError: isRotateValidationError,
    validationErrors: rotateValidationErrors,
    generalError: rotateGeneralError,
  } = useRotateSecretKey();

  const [webhookUrl, setWebhookUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (room) {
      setWebhookUrl(room.webhookUrl || "");
      setSecretKey(room.secretKey || "");
    }
  }, [room]);

  useEffect(() => {
    if (isUpdateValidationError && Object.keys(updateValidationErrors).length > 0) {
      setFieldErrors(updateValidationErrors);
      setGeneralError("");
    } else if (isRotateValidationError && Object.keys(rotateValidationErrors).length > 0) {
      setFieldErrors(rotateValidationErrors);
      setGeneralError("");
    } else if (updateGeneralError) {
      setGeneralError(updateGeneralError);
      setFieldErrors({});
    } else if (rotateGeneralError) {
      setGeneralError(rotateGeneralError);
      setFieldErrors({});
    } else {
      setFieldErrors({});
      setGeneralError("");
    }
  }, [
    isUpdateValidationError,
    updateValidationErrors,
    updateGeneralError,
    isRotateValidationError,
    rotateValidationErrors,
    rotateGeneralError,
  ]);

  useEffect(() => {
    if (isUpdateSuccess) onSaveSuccess?.();
  }, [isUpdateSuccess, onSaveSuccess]);

  const handleSaveWebhook = () => {
    setFieldErrors({});
    setGeneralError("");
    updateRoom({ data: { webhookUrl }, id: slug });
  };

  const handleCopySecretKey = async () => {
    try {
      await navigator.clipboard.writeText(secretKey || "");
      onCopySuccess?.();
    } catch (error) {
      console.error("Ошибка при копировании:", error);
    }
  };

  const handleRotateSecretKey = () => {
    setFieldErrors({});
    setGeneralError("");
    rotateSecretKey(slug);
  };

  return (
    <Box component="section" sx={{ mt: 4, pt: 3, borderTop: "1px solid #e0e0e0" }}>
      {generalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
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
        onRotateSecretKey={handleRotateSecretKey}
      />
    </Box>
  );
}
