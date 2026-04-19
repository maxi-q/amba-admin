import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomOrdContract } from "@/hooks/rooms/useRoomOrdContract";
import { useDeleteRoomOrdContract } from "@/hooks/rooms/useDeleteRoomOrdContract";
import { SettingsLoadingState } from "../settings/components/SettingsLoadingState";
import {
  ORD_CONTRACT_ACTION_OPTIONS,
  ORD_CONTRACT_SUBJECT_OPTIONS,
  ORD_COPY,
} from "./ord.constants";
import { formatOrdDate, ordContractTypeLabel } from "./ord.utils";

function labelFromOptions<T extends string>(options: { value: T; label: string }[], value: T | null | undefined): string {
  if (value == null) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

export default function OrdContractDetailPage() {
  const { slug, contractId } = useParams<{ slug: string; contractId: string }>();
  const navigate = useNavigate();

  const { room, isLoading: isRoomLoading, isError: isRoomErr, error: roomError } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";

  const {
    contract,
    isLoading: isContractLoading,
    isError: isContractErr,
    error: contractError,
  } = useRoomOrdContract(roomId, contractId ?? "");

  const { deleteRoomOrdContract, isPending: isDeletePending, generalError: deleteError } = useDeleteRoomOrdContract();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = () => {
    if (!roomId || !contractId) return;
    deleteRoomOrdContract(
      { roomId, contractId },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          navigate(`/rooms/${slug}/ord`);
        },
      }
    );
  };

  if (!contractId) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="error">Не указан договор</Alert>
      </Box>
    );
  }

  if (isRoomLoading || (roomId && contractId && isContractLoading)) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <SettingsLoadingState />
      </Box>
    );
  }

  if (isRoomErr || !room) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="error">{(roomError as Error)?.message ?? ORD_COPY.roomNotFound}</Alert>
      </Box>
    );
  }

  if (isContractErr || !contract) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="error">{(contractError as Error)?.message ?? "Договор не найден"}</Alert>
        <Button component={RouterLink} to={`/rooms/${slug}/ord`} sx={{ mt: 2 }}>
          К списку договоров
        </Button>
      </Box>
    );
  }

  const c = contract;

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
        <Typography variant="h6" fontWeight={700}>
          {ORD_COPY.contractDetail}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to={`/rooms/${slug}/ord`} variant="outlined" size="small">
            К списку
          </Button>
          <Button
            color="error"
            variant="outlined"
            size="small"
            onClick={() => setConfirmOpen(true)}
            disabled={isDeletePending}
          >
            {ORD_COPY.deleteContract}
          </Button>
        </Stack>
      </Stack>

      {deleteError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {deleteError}
        </Alert>
      ) : null}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Row label="Тип" value={ordContractTypeLabel(c.type)} />
          <Row label="Дата заключения" value={formatOrdDate(c.date)} />
          <Row label="Дата окончания" value={c.dateEnd ? formatOrdDate(c.dateEnd) : "—"} />
          <Row label="Сумма" value={c.amount ?? "—"} />
          <Row label="Тип действия" value={labelFromOptions(ORD_CONTRACT_ACTION_OPTIONS, c.actionType)} />
          <Row label="Предмет" value={labelFromOptions(ORD_CONTRACT_SUBJECT_OPTIONS, c.subjectType)} />
          <Row label="Флаги" value={c.flags.length ? c.flags.join(", ") : "—"} />
          <Typography variant="subtitle2" sx={{ pt: 1 }}>
            {ORD_COPY.client}
          </Typography>
          <Typography variant="body2">
            {c.clientOrdPerson.name} · ИНН {c.clientOrdPerson.inn}
          </Typography>
          <Typography variant="subtitle2" sx={{ pt: 1 }}>
            {ORD_COPY.contractor}
          </Typography>
          <Typography variant="body2">
            {c.contractorOrdPerson.name} · ИНН {c.contractorOrdPerson.inn}
          </Typography>
          <Row label="Синхронизация" value={c.syncedAt ? formatOrdDate(c.syncedAt) : "—"} />
          {c.lastSyncError ? (
            <Alert severity="warning">{c.lastSyncError}</Alert>
          ) : null}
        </Stack>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Удалить договор?</DialogTitle>
        <DialogContent>
          <DialogContentText>Это действие нельзя отменить.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Отмена</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={isDeletePending}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
