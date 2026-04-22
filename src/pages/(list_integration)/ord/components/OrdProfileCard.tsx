import type { Dispatch, SetStateAction } from "react";
import { Alert, AlertDescription, Badge, Button, Card, CardContent } from "@senler/ui";
import type { IRoomOrdProfile } from "@services/rooms/rooms.types";
import type { FioParts } from "@/utils/fio";
import { joinFio } from "@/utils/fio";
import { isCompleteRuMobile, ruPhoneToE164 } from "@/utils/ruPhone";
import { ORD_COPY } from "../ord.constants";
import { getOrdSyncPresentation, ordJuridicalLabel } from "../ord.utils";
import { FioTextFields } from "./FioTextFields";
import { RuPhoneTextField } from "./RuPhoneTextField";

type ApiFieldErrors = Record<string, string[] | undefined>;

type Props = {
  profile: IRoomOrdProfile;
  roomId: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  editFio: FioParts;
  onEditFioPatch: (patch: Partial<FioParts>) => void;
  editPhone: string;
  setEditPhone: Dispatch<SetStateAction<string>>;
  onSave: () => void;
  isUpdatePending: boolean;
  updateGeneralError: string;
  apiErrors: ApiFieldErrors;
  editAttempted: boolean;
};

function syncBadgeVariant(
  color: "default" | "success" | "error"
): "secondary" | "success" | "destructive" {
  if (color === "error") return "destructive";
  if (color === "success") return "success";
  return "secondary";
}

export function OrdProfileCard({
  profile,
  roomId,
  isEditing,
  onStartEdit,
  onCancelEdit,
  editFio,
  onEditFioPatch,
  editPhone,
  setEditPhone,
  onSave,
  isUpdatePending,
  updateGeneralError,
  apiErrors,
  editAttempted,
}: Props) {
  const sync = getOrdSyncPresentation(profile);
  const fullName = joinFio(editFio);
  const e164 = ruPhoneToE164(editPhone);
  const hasChanges = fullName !== profile.name || e164 !== profile.phone;
  const phoneOk = isCompleteRuMobile(editPhone);
  const saveDisabled = !roomId || isUpdatePending || !hasChanges;

  const nameApiError = apiErrors.name?.[0];
  const phoneHint = apiErrors.phone?.[0] ?? (!phoneOk && editAttempted ? ORD_COPY.phoneFormatHint : undefined);

  const mergeFio = (patch: Partial<FioParts>) => onEditFioPatch(patch);

  return (
    <Card className="max-w-2xl border border-border shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <h3 className="mb-3 text-base font-semibold text-foreground">{ORD_COPY.profileSectionTitle}</h3>

        {updateGeneralError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{updateGeneralError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mb-4 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              ID: {profile.id}
            </Badge>
            <Badge variant={syncBadgeVariant(sync.color)}>{sync.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground/90">ИНН: {profile.inn}</p>
          <p className="text-sm text-muted-foreground/90">
            Юридический тип: {ordJuridicalLabel(profile.juridicalType)}
          </p>
        </div>

        {profile.lastSyncError ? (
          <Alert className="mb-4 border-amber-500/40 bg-amber-500/5">
            <AlertDescription>{profile.lastSyncError}</AlertDescription>
          </Alert>
        ) : null}

        {isEditing ? (
          <div className="mb-4 grid max-w-md gap-4">
            <FioTextFields
              value={editFio}
              onChange={mergeFio}
              apiNameError={nameApiError}
              showRequiredErrors={editAttempted}
            />
            <RuPhoneTextField
              value={editPhone}
              setValue={setEditPhone}
              error={(!phoneOk && editAttempted) || !!apiErrors.phone?.length}
              helperText={phoneHint}
            />
          </div>
        ) : (
          <div className="mb-4 space-y-0.5">
            <p className="text-base font-semibold text-foreground">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.phone}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {isEditing ? (
            <>
              <Button
                type="button"
                size="lg"
                onClick={onSave}
                disabled={saveDisabled}
              >
                {isUpdatePending ? ORD_COPY.savePending : ORD_COPY.save}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={onCancelEdit}
                disabled={isUpdatePending}
              >
                {ORD_COPY.cancel}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" size="lg" onClick={onStartEdit}>
              {ORD_COPY.edit}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
