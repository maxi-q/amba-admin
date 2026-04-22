import type { Dispatch, SetStateAction } from "react";
import { Alert, AlertDescription, Button, Card, CardContent, InputField, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@senler/ui";
import type { IOrdJuridicalType } from "@services/rooms/rooms.types";
import type { FioParts } from "@/utils/fio";
import { isCompleteRuMobile } from "@/utils/ruPhone";
import { validateInn } from "@/utils/validateInn";
import { ORD_COPY, ORD_JURIDICAL_OPTIONS } from "../ord.constants";
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
    apiErrors.inn?.[0] ??
    (innValidation.error && (submitAttempted || innDigitsTyped) ? innValidation.error : undefined);

  const nameApiError = apiErrors.name?.[0];
  const submitDisabled = !roomId || isPending;

  return (
    <Card className="max-w-2xl border border-border shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-foreground">{ORD_COPY.createSectionTitle}</h3>

        {generalError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid max-w-md gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              ИНН
              <span className="text-destructive" aria-hidden>
                {" "}
                *
              </span>
            </p>
            <InputField
              value={inn}
              onChange={(e) => onInnChange(e.target.value)}
              error={showInnError}
              helperText={innHelper}
              aria-label="ИНН"
            />
          </div>

          <FioTextFields
            value={fio}
            onChange={onFioChange}
            apiNameError={nameApiError}
            showRequiredErrors={submitAttempted}
          />

          <RuPhoneTextField
            value={phone}
            setValue={setPhone}
            error={!!(apiErrors.phone?.length || (!phoneOk && submitAttempted))}
            helperText={
              apiErrors.phone?.[0] ?? (!phoneOk && submitAttempted ? ORD_COPY.phoneFormatHint : undefined)
            }
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Юридический тип</p>
            <Select
              value={juridicalType}
              onValueChange={(v) => onJuridicalChange(v as IOrdJuridicalType)}
            >
              <SelectTrigger className="h-10 w-full" aria-label="Юридический тип">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORD_JURIDICAL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {apiErrors.juridicalType?.[0] ? (
              <p className="text-sm text-destructive">{apiErrors.juridicalType[0]}</p>
            ) : null}
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            disabled={submitDisabled}
            onClick={onSubmit}
          >
            {isPending ? ORD_COPY.submitCreatePending : ORD_COPY.submitCreate}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
