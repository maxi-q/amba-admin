import { useState, useEffect } from "react";
import { Box, List } from "@mui/material";
import { Loader } from "../../../components/Loader";
import { useRooms } from "@/hooks/rooms/useRooms";
import { useCreateRoom } from "@/hooks/rooms/useCreateRoom";
import { RoomsHeader } from "./components/RoomsHeader";
import { CreateRoomButton } from "./components/CreateRoomButton";
import { RoomCard } from "./components/RoomCard";
import { RoomsEmptyState } from "./components/RoomsEmptyState";
import { CreateRoomDialog } from "./components/CreateRoomDialog";

export default function RoomsPage() {
  const { rooms, isLoading } = useRooms();
  const {
    createRoom,
    isPending,
    isValidationError,
    validationErrors,
    generalError: hookGeneralError
  } = useCreateRoom();

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    webhookUrl: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>('');

  useEffect(() => {
    if (isValidationError && Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setGeneralError('');
    } else if (hookGeneralError) {
      setGeneralError(hookGeneralError);
      setFieldErrors({});
    } else {
      setFieldErrors({});
      setGeneralError('');
    }
  }, [isValidationError, validationErrors, hookGeneralError]);

  const handleCreateRoom = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', webhookUrl: '' });
    setFieldErrors({});
    setGeneralError('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setFieldErrors({});
    setGeneralError('');

    createRoom({
      name: formData.name,
      webhookUrl: formData.webhookUrl,
    });
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", width: "100%", px: 2, py: 3 }}>
      <RoomsHeader />
      <CreateRoomButton onClick={handleCreateRoom} />
      <List>
        {rooms.length ? (
          rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))
        ) : (
          <RoomsEmptyState onCreateClick={handleCreateRoom} />
        )}
      </List>

      <CreateRoomDialog
        open={openDialog}
        formData={formData}
        fieldErrors={fieldErrors}
        generalError={generalError}
        isPending={isPending}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
      />
    </Box>
  );
}
