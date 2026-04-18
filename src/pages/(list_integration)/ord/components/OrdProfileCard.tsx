import type { Dispatch, SetStateAction } from "react";
import { Alert, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import type { IRoomOrdProfile } from "@services/rooms/rooms.types";
import type { FioParts } from "@/utils/fio";
import { joinFio } from "@/utils/fio";
import { isCompleteRuMobile, ruPhoneToE164 } from "@/utils/ruPhone";
import { ORD_COPY, ORD_STATIC_FIELDS_SX, ordContainedPrimarySx } from "../ord.constants";
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
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {ORD_COPY.profileSectionTitle}
      </Typography>

      {updateGeneralError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {updateGeneralError}
        </Alert>
      ) : null}

      <Stack spacing={2}>
        <Stack spacing={1.25} sx={ORD_STATIC_FIELDS_SX}>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
            <Chip size="small" label={`ID: ${profile.id}`} variant="outlined" />
            <Chip
              size="small"
              label={sync.label}
              color={sync.color === "default" ? "default" : sync.color}
              variant="outlined"
            />
          </Stack>
          <Typography variant="body2">ИНН: {profile.inn}</Typography>
          <Typography variant="body2">Юридический тип: {ordJuridicalLabel(profile.juridicalType)}</Typography>
        </Stack>

        {profile.lastSyncError ? (
          <Alert severity="warning" sx={{ py: 0 }}>
            {profile.lastSyncError}
          </Alert>
        ) : null}

        {isEditing ? (
          <Stack spacing={2} maxWidth={480}>
            <FioTextFields
              value={editFio}
              onChange={mergeFio}
              apiNameError={nameApiError}
              showRequiredErrors={editAttempted}
            />
            <RuPhoneTextField
              label="Телефон"
              value={editPhone}
              setValue={setEditPhone}
              error={(!phoneOk && editAttempted) || !!apiErrors.phone?.length}
              helperText={phoneHint}
            />
          </Stack>
        ) : (
          <Stack spacing={0.5}>
            <Typography variant="body1" fontWeight={600}>
              {profile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.phone}
            </Typography>
          </Stack>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
          {isEditing ? (
            <>
              <Button variant="contained" disabled={saveDisabled} onClick={onSave} sx={ordContainedPrimarySx}>
                {isUpdatePending ? ORD_COPY.savePending : ORD_COPY.save}
              </Button>
              <Button variant="text" onClick={onCancelEdit} disabled={isUpdatePending}>
                {ORD_COPY.cancel}
              </Button>
            </>
          ) : (
            <Button variant="outlined" onClick={onStartEdit} sx={{ alignSelf: "flex-start" }}>
              {ORD_COPY.edit}
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
