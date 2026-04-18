import type { Dispatch, SetStateAction } from "react";
import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import type { IOrdJuridicalType } from "@services/rooms/rooms.types";
import type { FioParts } from "@/utils/fio";
import { isCompleteRuMobile } from "@/utils/ruPhone";
import { validateInn } from "@/utils/validateInn";
import { ORD_COPY, ORD_JURIDICAL_OPTIONS, ordContainedPrimarySx } from "../ord.constants";
import { FioTextFields } from "./FioTextFields";
import { RuPhoneTextField } from "./RuPhoneTextField";

type ApiFieldErrors = Record<string, string[] | undefined>;

type Props = {
  inn: string;
  onInnChange: (value: string) => void;
  fio: FioParts;
  onFioChange: (patch: Partial<FioParts>) => void;
  phone: string;
  setPhone: Dispatch<SetStateAction<string>>;
  juridicalType: IOrdJuridicalType;
  onJuridicalChange: (value: IOrdJuridicalType) => void;
  submitAttempted: boolean;
  onSubmit: () => void;
  isPending: boolean;
  roomId: string;
  generalError: string;
  apiErrors: ApiFieldErrors;
};

export function CreateOrdProfileForm({
  inn,
  onInnChange,
  fio,
  onFioChange,
  phone,
  setPhone,
  juridicalType,
  onJuridicalChange,
  submitAttempted,
  onSubmit,
  isPending,
  roomId,
  generalError,
  apiErrors,
}: Props) {
  const innValidation = validateInn(inn, juridicalType);
  const phoneOk = isCompleteRuMobile(phone);
  const innDigitsTyped = inn.replace(/\D/g, "").length > 0;
  const showInnError =
    !!apiErrors.inn?.length || !!(innValidation.error && (submitAttempted || innDigitsTyped));

  const innHelper =
    apiErrors.inn?.[0] ?? (innValidation.error && (submitAttempted || innDigitsTyped) ? innValidation.error : undefined);

  const nameApiError = apiErrors.name?.[0];
  const submitDisabled = !roomId || isPending;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {ORD_COPY.createSectionTitle}
      </Typography>

      {generalError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalError}
        </Alert>
      ) : null}

      <Stack spacing={2} maxWidth={480}>
        <TextField
          label="ИНН"
          size="small"
          required
          value={inn}
          onChange={(e) => onInnChange(e.target.value)}
          error={showInnError}
          helperText={innHelper}
        />

        <FioTextFields
          value={fio}
          onChange={onFioChange}
          apiNameError={nameApiError}
          showRequiredErrors={submitAttempted}
        />

        <RuPhoneTextField
          label="Телефон"
          value={phone}
          setValue={setPhone}
          error={!!(apiErrors.phone?.length || (!phoneOk && submitAttempted))}
          helperText={
            apiErrors.phone?.[0] ??
            (!phoneOk && submitAttempted ? ORD_COPY.phoneFormatHint : undefined)
          }
        />

        <TextField
          select
          label="Юридический тип"
          size="small"
          value={juridicalType}
          onChange={(e) => onJuridicalChange(e.target.value as IOrdJuridicalType)}
          error={!!apiErrors.juridicalType?.length}
          helperText={apiErrors.juridicalType?.[0]}
        >
          {ORD_JURIDICAL_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" disabled={submitDisabled} onClick={onSubmit} sx={{ alignSelf: "flex-start", ...ordContainedPrimarySx }}>
          {isPending ? ORD_COPY.submitCreatePending : ORD_COPY.submitCreate}
        </Button>
      </Stack>
    </Paper>
  );
}
