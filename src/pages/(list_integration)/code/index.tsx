import { useParams } from "react-router-dom";
import { Box, Snackbar } from "@mui/material";
import { useState } from "react";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { SettingsLoadingState } from "../settings/components/SettingsLoadingState";
import { SettingsErrorState } from "../settings/components/SettingsErrorState";
import { SettingsNotFoundState } from "../settings/components/SettingsNotFoundState";
import { FormForSiteSection } from "../settings/components/FormForSiteSection";

export default function CodePage() {
  const { slug } = useParams();

  const {
    room,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError
  } = useGetRoomById(slug || '');

  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyNotification(true);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
    }
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
      <FormForSiteSection
        roomId={room.id}
        onCopy={handleCopyToClipboard}
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
