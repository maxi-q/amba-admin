import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Alert,
  MenuItem,
  Divider,
  Chip,
} from "@mui/material";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useCreateRoomOrdProfile } from "@/hooks/rooms/useCreateRoomOrdProfile";
import { useUpdateRoomOrdProfile } from "@/hooks/rooms/useUpdateRoomOrdProfile";
import { SettingsLoadingState } from "../settings/components/SettingsLoadingState";
import { PRIMARY_COLOR } from "@/constants/colors";
import type { IOrdJuridicalType, IOrdSyncStatus, IRoomOrdProfile } from "@services/rooms/rooms.types";

const JURIDICAL_OPTIONS: { value: IOrdJuridicalType; label: string }[] = [
  { value: "physical", label: "Физ. лицо" },
  { value: "ip", label: "ИП" },
  { value: "juridical", label: "Юр. лицо" },
];

const SYNC_LABELS: Record<IOrdSyncStatus, string> = {
  pending: "Ожидает синхронизации",
  synced: "Синхронизировано",
  error: "Ошибка синхронизации",
};

function OrdProfileSummary({ profile }: { profile: IRoomOrdProfile }) {
  return (
    <Stack spacing={1} sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Ответ сервера
      </Typography>
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
        <Chip size="small" label={`ID: ${profile.id}`} variant="outlined" />
        <Chip size="small" label={`ИНН: ${profile.inn}`} variant="outlined" />
        <Chip
          size="small"
          label={SYNC_LABELS[profile.syncStatus]}
          color={profile.syncStatus === "synced" ? "success" : profile.syncStatus === "error" ? "error" : "default"}
          variant="outlined"
        />
      </Stack>
      <Typography variant="body2">{profile.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {profile.phone}
      </Typography>
      {profile.lastError ? (
        <Alert severity="warning" sx={{ py: 0 }}>
          {profile.lastError}
        </Alert>
      ) : null}
    </Stack>
  );
}

/**
 * ОРД: POST и PUT профиля комнаты (rooms/:id/ord-profile).
 */
export default function OrdPage() {
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading, isError, error } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";

  const [createInn, setCreateInn] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createJuridical, setCreateJuridical] = useState<IOrdJuridicalType>("physical");

  const [updateName, setUpdateName] = useState("");
  const [updatePhone, setUpdatePhone] = useState("");

  const [lastCreateResult, setLastCreateResult] = useState<IRoomOrdProfile | null>(null);
  const [lastUpdateResult, setLastUpdateResult] = useState<IRoomOrdProfile | null>(null);

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

  const handleCreate = () => {
    if (!roomId) return;
    resetCreate();
    setLastCreateResult(null);
    createRoomOrdProfile(
      {
        roomId,
        data: {
          inn: createInn.trim(),
          name: createName.trim(),
          phone: createPhone.trim(),
          juridicalType: createJuridical,
        },
      },
      {
        onSuccess: (data) => setLastCreateResult(data),
      }
    );
  };

  const handleUpdate = () => {
    if (!roomId) return;
    const name = updateName.trim();
    const phone = updatePhone.trim();
    const data: { name?: string; phone?: string } = {};
    if (name) data.name = name;
    if (phone) data.phone = phone;
    if (!data.name && !data.phone) return;

    resetUpdate();
    setLastUpdateResult(null);
    updateRoomOrdProfile(
      { roomId, data },
      {
        onSuccess: (d) => setLastUpdateResult(d),
      }
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <SettingsLoadingState />
      </Box>
    );
  }

  if (isError || !room) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="error">{(error as Error)?.message ?? "Комната не найдена"}</Alert>
      </Box>
    );
  }

  const createDisabled =
    !roomId ||
    isCreatePending ||
    !createInn.trim() ||
    !createName.trim() ||
    !createPhone.trim();

  const updateDisabled =
    !roomId || isUpdatePending || (!updateName.trim() && !updatePhone.trim());

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        ОРД
      </Typography>

      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Создать профиль ОРД
          </Typography>
          {createGeneralError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createGeneralError}
            </Alert>
          ) : null}
          <Stack spacing={2} maxWidth={480}>
            <TextField
              label="ИНН"
              size="small"
              value={createInn}
              onChange={(e) => setCreateInn(e.target.value)}
              required
              error={!!createValidationErrors.inn?.length}
              helperText={createValidationErrors.inn?.[0]}
            />
            <TextField
              label="Наименование"
              size="small"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              required
              error={!!createValidationErrors.name?.length}
              helperText={createValidationErrors.name?.[0]}
            />
            <TextField
              label="Телефон"
              size="small"
              value={createPhone}
              onChange={(e) => setCreatePhone(e.target.value)}
              required
              error={!!createValidationErrors.phone?.length}
              helperText={createValidationErrors.phone?.[0]}
            />
            <TextField
              select
              label="Юридический тип"
              size="small"
              value={createJuridical}
              onChange={(e) => setCreateJuridical(e.target.value as IOrdJuridicalType)}
              error={!!createValidationErrors.juridicalType?.length}
              helperText={createValidationErrors.juridicalType?.[0]}
            >
              {JURIDICAL_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              disabled={createDisabled}
              onClick={handleCreate}
              sx={{
                alignSelf: "flex-start",
                backgroundColor: PRIMARY_COLOR,
                "&:hover": { backgroundColor: PRIMARY_COLOR, opacity: 0.9 },
              }}
            >
              {isCreatePending ? "Отправка…" : "Создать"}
            </Button>
          </Stack>
          {lastCreateResult ? <OrdProfileSummary profile={lastCreateResult} /> : null}
        </Paper>

        <Divider />

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Обновить профиль ОРД
          </Typography>
          {updateGeneralError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {updateGeneralError}
            </Alert>
          ) : null}
          <Stack spacing={2} maxWidth={480}>
            <TextField
              label="Наименование"
              size="small"
              value={updateName}
              onChange={(e) => setUpdateName(e.target.value)}
              error={!!updateValidationErrors.name?.length}
              helperText={updateValidationErrors.name?.[0] ?? "Необязательно, если меняете только телефон"}
            />
            <TextField
              label="Телефон"
              size="small"
              value={updatePhone}
              onChange={(e) => setUpdatePhone(e.target.value)}
              error={!!updateValidationErrors.phone?.length}
              helperText={updateValidationErrors.phone?.[0]}
            />
            <Button
              variant="outlined"
              disabled={updateDisabled}
              onClick={handleUpdate}
              sx={{ alignSelf: "flex-start" }}
            >
              {isUpdatePending ? "Отправка…" : "Сохранить изменения"}
            </Button>
          </Stack>
          {lastUpdateResult ? <OrdProfileSummary profile={lastUpdateResult} /> : null}
        </Paper>
      </Stack>
    </Box>
  );
}
