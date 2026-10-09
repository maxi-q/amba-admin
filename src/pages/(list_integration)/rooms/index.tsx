import { useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription, Button, PageLoader } from "@senler/ui";
import { useRooms } from "@/hooks/rooms/useRooms";
import { useCreateRoom } from "@/hooks/rooms/useCreateRoom";
import { RoomsWelcome } from "./components/RoomsWelcome";
import { CreateCompanyForm } from "./components/CreateCompanyForm";
import { pickInitialRoom, rememberLastOpenedRoom } from "./roomSelection";

export default function RoomsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { rooms, isLoading, isFetching, isError, error, refetch } = useRooms();
  const {
    createRoom,
    isPending,
    isValidationError,
    validationErrors,
    generalError: hookGeneralError,
  } = useCreateRoom();

  const availableRooms = rooms.filter((room) => !room.isDeleted);
  const createRequested = searchParams.get("create") === "1";
  const [isCreating, setIsCreating] = useState(createRequested);
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

  useEffect(() => {
    if (createRequested) setIsCreating(true);
  }, [createRequested]);

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
    navigate("/", { replace: true });
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
          setIsCreating(false);
          resetCreateForm();
          if (createdRoom?.id) {
            rememberLastOpenedRoom(createdRoom.id);
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

  if (isError) {
    return (
      <div className="w-full px-6 py-6">
        <Alert variant="destructive">
          <AlertDescription>{error?.message || "Не удалось загрузить компании"}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" disabled={isFetching} onClick={() => void refetch()}>
          {isFetching ? "Загрузка…" : "Повторить"}
        </Button>
      </div>
    );
  }

  const initialRoom = pickInitialRoom(availableRooms);
  const isFirstCompany = availableRooms.length === 0;

  if (initialRoom && !isCreating) {
    return <Navigate to={`/rooms/${initialRoom.id}`} replace />;
  }

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

  return null;
}
