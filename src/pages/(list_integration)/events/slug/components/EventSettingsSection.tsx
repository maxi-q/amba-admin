import { Box, Stack, TextField, Typography, Switch } from "@mui/material";
import type { IPatchEventsRequest } from "@services/events/events.types";

interface EventSettingsSectionProps {
  formData: IPatchEventsRequest;
  prefix: string;
  onInputChange: (field: keyof IPatchEventsRequest) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPrefixChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  createValidationErrors?: Record<string, string[]>;
  updateValidationErrors?: Record<string, string[]>;
  prefixValidationError?: string;
  prefixOccupiedError?: string;
  checkPrefixValidationErrors?: Record<string, string[]>;
  isNewEvent: boolean;
  onIgnoreEndDateChange: (value: boolean) => void;
}

export const EventSettingsSection = ({
  formData,
  prefix,
  onInputChange,
  onPrefixChange,
  createValidationErrors,
  updateValidationErrors,
  prefixValidationError,
  prefixOccupiedError,
  checkPrefixValidationErrors,
  isNewEvent,
  onIgnoreEndDateChange,
}: EventSettingsSectionProps) => {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" mb={1}>
          Название
        </Typography>
        <TextField
          fullWidth
          placeholder="Будет показываться вам и определенным амбассадорам"
          variant="outlined"
          value={formData.name}
          onChange={onInputChange('name')}
          error={!!(createValidationErrors?.name || updateValidationErrors?.name)}
          helperText={(createValidationErrors?.name || updateValidationErrors?.name)?.join()}
        />
      </Box>

      <Box>
        <Typography variant="subtitle2" mb={1}>
          Описание
        </Typography>
        <TextField
          fullWidth
          placeholder="Текст описания события"
          variant="outlined"
          multiline
          minRows={3}
          value={formData.description}
          onChange={onInputChange('description')}
          error={!!(createValidationErrors?.description || updateValidationErrors?.description)}
          helperText={(createValidationErrors?.description || updateValidationErrors?.description)?.join()}
        />
      </Box>

      <Box>
        <Typography variant="subtitle2" mb={1}>
          Префикс промокода
        </Typography>
        <TextField
          fullWidth
          placeholder="Уникальный префикс для промокодов этого события"
          variant="outlined"
          value={prefix}
          onChange={onPrefixChange}
          disabled={!isNewEvent}
          error={!!(createValidationErrors?.promoCodesPrefix || checkPrefixValidationErrors?.promoCodesPrefix)}
          helperText={
            (createValidationErrors?.promoCodesPrefix || checkPrefixValidationErrors?.promoCodesPrefix)?.join() ||
            prefixValidationError ||
            prefixOccupiedError ||
            (!isNewEvent ? 'Префикс создается один раз при создании события и не может быть изменен' : 'Префикс будет использоваться для генерации уникальных промокодов')
          }
        />
      </Box>

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2">
            Ограничить событие датами
          </Typography>
          <Switch
            checked={!formData.ignoreEndDate}
            onChange={(e) => onIgnoreEndDateChange(!e.target.checked)}
          />
        </Stack>
        {!formData.ignoreEndDate && (
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="date"
              value={formData.startDate}
              onChange={onInputChange('startDate')}
              variant="outlined"
              sx={{ flex: 1 }}
              error={!!(createValidationErrors?.startDate || updateValidationErrors?.startDate)}
              helperText={(createValidationErrors?.startDate || updateValidationErrors?.startDate)?.join()}
            />
            <TextField
              type="date"
              value={formData.endDate}
              onChange={onInputChange('endDate')}
              variant="outlined"
              sx={{ flex: 1 }}
              error={!!(createValidationErrors?.endDate || updateValidationErrors?.endDate)}
              helperText={(createValidationErrors?.endDate || updateValidationErrors?.endDate)?.join()}
            />
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

