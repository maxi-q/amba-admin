import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLoader } from "@senler/ui";
import { useRooms } from "@/hooks/rooms/useRooms";
import { useCreateRoom } from "@/hooks/rooms/useCreateRoom";
import { RoomsHeader } from "./components/RoomsHeader";
import { CreateRoomButton } from "./components/CreateRoomButton";
import { RoomCard } from "./components/RoomCard";
import { RoomsWelcome } from "./components/RoomsWelcome";
import { CreateCompanyForm } from "./components/CreateCompanyForm";

export default function RoomsPage() {
  const navigate = useNavigate();
  const { rooms, isLoading } = useRooms();
  const {
    createRoom,
    isPending,
    isValidationError,
    validationErrors,
    generalError: hookGeneralError,
  } = useCreateRoom();

  const [isCreating, setIsCreating] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (isValidationError && Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setGeneralError("");
    } else if (hookGeneralError) {
      setGeneralError(hookGeneralError);
      setFieldErrors({});
    } else {
      setFieldErrors({});
      setGeneralError("");
    }
  }, [isValidationError, validationErrors, hookGeneralError]);

  const resetCreateForm = () => {
    setCompanyName("");
    setFieldErrors({});
    setGeneralError("");
  };

  const handleOpenCreate = () => {
    resetCreateForm();
    setIsCreating(true);
  };

  const handleCloseCreate = () => {
    setIsCreating(false);
    resetCreateForm();
  };

  const handleSubmit = () => {
    if (!companyName.trim()) return;

    setFieldErrors({});
    setGeneralError("");

    // Аватар пока только в UI; для бэкенда — buildCompanyAvatarFormData() в types/companyAvatar.ts
    createRoom(
      {
        name: companyName.trim(),
        webhookUrl: "",
      },
      {
        onSuccess: (createdRoom) => {
          handleCloseCreate();
          if (createdRoom?.id) {
            navigate(`/rooms/${createdRoom.id}/onboarding/tariff`);
          }
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  const isFirstCompany = rooms.length === 0;

  if (isFirstCompany && !isCreating) {
    return <RoomsWelcome onGetStarted={handleOpenCreate} />;
  }

  if (isCreating) {
    return (
      <CreateCompanyForm
        isFirst={isFirstCompany}
        name={companyName}
        fieldErrors={fieldErrors}
        generalError={generalError}
        isPending={isPending}
        onNameChange={setCompanyName}
        onBack={handleCloseCreate}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div className="min-h-[652px] w-full px-6 py-6">
      <RoomsHeader />
      <CreateRoomButton onClick={handleOpenCreate} />
      <div className="flex flex-col p-0">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
