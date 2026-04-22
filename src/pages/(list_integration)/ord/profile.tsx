import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, PageLoader } from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useCreateRoomOrdProfile } from "@/hooks/rooms/useCreateRoomOrdProfile";
import { useUpdateRoomOrdProfile } from "@/hooks/rooms/useUpdateRoomOrdProfile";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import type { IOrdJuridicalType } from "@services/rooms/rooms.types";
import { EMPTY_FIO, isFioComplete, joinFio, parseFioFromApi } from "@/utils/fio";
import { formatRuMobileInput, INITIAL_RU_PHONE_DISPLAY, isCompleteRuMobile, ruPhoneToE164 } from "@/utils/ruPhone";
import { validateInn } from "@/utils/validateInn";
import { CreateOrdProfileForm } from "./components/CreateOrdProfileForm";
import { OrdProfileCard } from "./components/OrdProfileCard";
import { ORD_COPY } from "./ord.constants";

/**
 * ОРД: POST и PUT профиля комнаты (`rooms/:id/ord-profile`).
 */
export default function OrdProfilePage() {
  const queryClient = useQueryClient();
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading, isError, error } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";

  const [createInn, setCreateInn] = useState("");
  const [createFio, setCreateFio] = useState(EMPTY_FIO);
  const [createPhone, setCreatePhone] = useState(INITIAL_RU_PHONE_DISPLAY);
  const [createJuridical, setCreateJuridical] = useState<IOrdJuridicalType>("physical");
  const [createAttempted, setCreateAttempted] = useState(false);

  const [isEditingOrd, setIsEditingOrd] = useState(false);
  const [editFio, setEditFio] = useState(EMPTY_FIO);
  const [editPhone, setEditPhone] = useState(INITIAL_RU_PHONE_DISPLAY);
  const [editAttempted, setEditAttempted] = useState(false);

  const {
    createRoomOrdProfile,
    isPending: isCreatePending,
    generalError: createGeneralError,
    validationErrors: createValidationErrors,
    reset: resetCreate,
  } = useCreateRoomOrdProfile();

  const {
    updateRoomOrdProfile,
    isPending: isUpdatePending,
    generalError: updateGeneralError,
    validationErrors: updateValidationErrors,
    reset: resetUpdate,
  } = useUpdateRoomOrdProfile();

  const ordPerson = room?.ordPerson ?? null;

  useEffect(() => {
    if (!ordPerson) setIsEditingOrd(false);
  }, [ordPerson?.id]);

  const invalidateRoom = () => {
    if (roomId) queryClient.invalidateQueries({ queryKey: [QueryKeys.ROOMS, roomId] });
  };

  const innOk = !validateInn(createInn, createJuridical).error;
  const createFormValid = innOk && isFioComplete(createFio) && isCompleteRuMobile(createPhone);

  const handleCreate = () => {
    if (!roomId) return;
    if (!createFormValid) {
      setCreateAttempted(true);
      return;
    }
    setCreateAttempted(false);
    resetCreate();
    const { normalized: innNormalized } = validateInn(createInn, createJuridical);
    createRoomOrdProfile(
      {
        roomId,
        data: {
          inn: innNormalized,
          name: joinFio(createFio),
          phone: ruPhoneToE164(createPhone),
          juridicalType: createJuridical,
        },
      },
      { onSuccess: invalidateRoom }
    );
  };

  const handleStartEdit = () => {
    if (!ordPerson) return;
    resetUpdate();
    setEditAttempted(false);
    setEditFio(parseFioFromApi(ordPerson.name));
    setEditPhone(formatRuMobileInput(ordPerson.phone));
    setIsEditingOrd(true);
  };

  const handleCancelEdit = () => {
    setIsEditingOrd(false);
    setEditAttempted(false);
    resetUpdate();
  };

  const handleSave = () => {
    if (!roomId || !ordPerson) return;
    const fullName = joinFio(editFio);
    const phone = ruPhoneToE164(editPhone);
    if (!isFioComplete(editFio) || !isCompleteRuMobile(editPhone)) {
      setEditAttempted(true);
      return;
    }
    const payload: { name?: string; phone?: string } = {};
    if (fullName !== ordPerson.name) payload.name = fullName;
    if (phone !== ordPerson.phone) payload.phone = phone;
    if (!payload.name && !payload.phone) return;

    setEditAttempted(false);
    resetUpdate();
    updateRoomOrdProfile(
      { roomId, data: payload },
      {
        onSuccess: () => {
          invalidateRoom();
          setIsEditingOrd(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="w-full px-2 py-3">
        <Alert variant="destructive">
          <AlertDescription>{(error as Error)?.message ?? ORD_COPY.roomNotFound}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full px-2 pb-6">
      <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">
        {ORD_COPY.profileSectionTitle}
      </h2>

      <div className="flex flex-col gap-6">
        {!ordPerson ? (
          <CreateOrdProfileForm
            roomId={roomId}
            inn={createInn}
            onInnChange={setCreateInn}
            fio={createFio}
            onFioChange={(patch) => setCreateFio((prev) => ({ ...prev, ...patch }))}
            phone={createPhone}
            setPhone={setCreatePhone}
            juridicalType={createJuridical}
            onJuridicalChange={setCreateJuridical}
            submitAttempted={createAttempted}
            onSubmit={handleCreate}
            isPending={isCreatePending}
            generalError={createGeneralError}
            apiErrors={createValidationErrors}
          />
        ) : null}

        {ordPerson ? (
          <OrdProfileCard
            profile={ordPerson}
            roomId={roomId}
            isEditing={isEditingOrd}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            editFio={editFio}
            onEditFioPatch={(patch) => setEditFio((prev) => ({ ...prev, ...patch }))}
            editPhone={editPhone}
            setEditPhone={setEditPhone}
            onSave={handleSave}
            isUpdatePending={isUpdatePending}
            updateGeneralError={updateGeneralError}
            apiErrors={updateValidationErrors}
            editAttempted={editAttempted}
          />
        ) : null}
      </div>
    </div>
  );
}
