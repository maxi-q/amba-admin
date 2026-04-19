import { useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  Link,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomOrdContracts } from "@/hooks/rooms/useRoomOrdContracts";
import { useCreateRoomOrdContract } from "@/hooks/rooms/useCreateRoomOrdContract";
import { useRoomApplications } from "@/hooks/ambassador/useRoomApplications";
import { SettingsLoadingState } from "../settings/components/SettingsLoadingState";
import {
  ORD_CONTRACT_ACTION_OPTIONS,
  ORD_CONTRACT_SUBJECT_OPTIONS,
  ORD_CONTRACT_TYPE_OPTIONS,
  ORD_COPY,
} from "./ord.constants";
import { formatOrdDate, ordContractTypeLabel } from "./ord.utils";
import type { IOrdContractFlag, IOrdContractType } from "@services/rooms/rooms.types";

const FLAG_OPTIONS: { value: IOrdContractFlag; label: string }[] = [
  { value: "vat_included", label: "НДС включён" },
  { value: "contractor_is_creatives_reporter", label: "Исполнитель — репортёр креативов" },
  { value: "agent_acting_for_publisher", label: "Агент действует для издателя" },
  { value: "is_charge_paid_by_agent", label: "Вознаграждение платит агент" },
];

export default function OrdContractsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading: isRoomLoading, isError, error } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { contracts, pagination, isLoading: isContractsLoading, isError: isContractsError, error: contractsError } =
    useRoomOrdContracts(roomId, { page, size: pageSize });

  const { applications: approvedApps, isLoading: isAppsLoading } = useRoomApplications({
    status: "approved",
    roomIds: roomId ? [roomId] : [],
    page: 1,
    size: 100,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [ambassadorRoomId, setAmbassadorRoomId] = useState("");
  const [contractType, setContractType] = useState<IOrdContractType>("service");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [dateEndStr, setDateEndStr] = useState("");
  const [amount, setAmount] = useState("");
  const [actionType, setActionType] = useState<string>("");
  const [subjectType, setSubjectType] = useState<string>("");
  const [flags, setFlags] = useState<IOrdContractFlag[]>([]);

  const {
    createRoomOrdContract,
    isPending: isCreatePending,
    generalError: createGeneralError,
    reset: resetCreate,
  } = useCreateRoomOrdContract();

  const resetForm = () => {
    setAmbassadorRoomId("");
    setContractType("service");
    setDateStr(new Date().toISOString().slice(0, 10));
    setDateEndStr("");
    setAmount("");
    setActionType("");
    setSubjectType("");
    setFlags([]);
    resetCreate();
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const toggleFlag = (value: IOrdContractFlag) => {
    setFlags((prev) => (prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]));
  };

  const ambassadorOptions = useMemo(
    () =>
      approvedApps.map((a) => ({
        id: a.id,
        label: `${a.name} · ИНН ${a.inn}`,
      })),
    [approvedApps]
  );

  const handleSubmitCreate = () => {
    if (!roomId || !ambassadorRoomId) return;
    const dateIso = new Date(`${dateStr}T12:00:00`).toISOString();
    createRoomOrdContract(
      {
        roomId,
        data: {
          ambassadorRoomId,
          type: contractType,
          date: dateIso,
          ...(dateEndStr ? { dateEnd: new Date(`${dateEndStr}T12:00:00`).toISOString() } : {}),
          ...(amount.trim() ? { amount: amount.trim() } : {}),
          ...(actionType ? { actionType: actionType as (typeof ORD_CONTRACT_ACTION_OPTIONS)[number]["value"] } : {}),
          ...(subjectType ? { subjectType: subjectType as (typeof ORD_CONTRACT_SUBJECT_OPTIONS)[number]["value"] } : {}),
          ...(flags.length ? { flags } : {}),
        },
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          resetForm();
        },
      }
    );
  };

  const hasOrdProfile = !!room?.ordPerson;

  if (isRoomLoading) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <SettingsLoadingState />
      </Box>
    );
  }

  if (isError || !room) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="error">{(error as Error)?.message ?? ORD_COPY.roomNotFound}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
        <Typography variant="h6" fontWeight={700}>
          {ORD_COPY.contractsTitle}
        </Typography>
        <Button variant="contained" onClick={handleOpenDialog} disabled={!hasOrdProfile || isAppsLoading}>
          {ORD_COPY.createContract}
        </Button>
      </Stack>

      {!hasOrdProfile ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {ORD_COPY.noOrdProfileHint}{" "}
          <Link component={RouterLink} to={`/rooms/${slug}/ord/profile`} underline="hover">
            Перейти к профилю ОРД
          </Link>
        </Alert>
      ) : null}

      {isContractsError ? (
        <Alert severity="error">{(contractsError as Error)?.message ?? "Не удалось загрузить договоры"}</Alert>
      ) : null}

      {isContractsLoading ? (
        <SettingsLoadingState />
      ) : contracts.length === 0 ? (
        <Typography color="text.secondary">{ORD_COPY.noContracts}</Typography>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Тип</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>{ORD_COPY.client}</TableCell>
                  <TableCell>{ORD_COPY.contractor}</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {contracts.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{ordContractTypeLabel(c.type)}</TableCell>
                    <TableCell>{formatOrdDate(c.date)}</TableCell>
                    <TableCell>
                      {c.clientOrdPerson.name}
                      <Typography variant="caption" display="block" color="text.secondary">
                        ИНН {c.clientOrdPerson.inn}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {c.contractorOrdPerson.name}
                      <Typography variant="caption" display="block" color="text.secondary">
                        ИНН {c.contractorOrdPerson.inn}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{c.amount ?? "—"}</TableCell>
                    <TableCell align="right">
                      <Button component={RouterLink} to={`/rooms/${slug}/ord/${c.id}`} size="small">
                        {ORD_COPY.openContract}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination && pagination.totalPages > 1 ? (
            <Stack alignItems="center" sx={{ mt: 2 }}>
              <Pagination
                color="primary"
                page={page}
                count={pagination.totalPages}
                onChange={(_e, p) => setPage(p)}
              />
            </Stack>
          ) : null}
        </>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{ORD_COPY.createContract}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {createGeneralError ? <Alert severity="error">{createGeneralError}</Alert> : null}

            <FormControl fullWidth required size="small">
              <InputLabel id="ord-am-label">Амбассадор в комнате</InputLabel>
              <Select
                labelId="ord-am-label"
                label="Амбассадор в комнате"
                value={ambassadorRoomId}
                onChange={(e) => setAmbassadorRoomId(e.target.value)}
              >
                {ambassadorOptions.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {ambassadorOptions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Нет одобренных амбассадоров с заявкой в эту комнату. Сначала одобрите заявку во вкладке «Заявки».
              </Typography>
            ) : null}

            <FormControl fullWidth size="small">
              <InputLabel id="ord-type-label">Тип договора</InputLabel>
              <Select
                labelId="ord-type-label"
                label="Тип договора"
                value={contractType}
                onChange={(e) => setContractType(e.target.value as IOrdContractType)}
              >
                {ORD_CONTRACT_TYPE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Дата заключения"
              type="date"
              size="small"
              fullWidth
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Дата окончания"
              type="date"
              size="small"
              fullWidth
              value={dateEndStr}
              onChange={(e) => setDateEndStr(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Сумма"
              size="small"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Необязательно"
            />

            <FormControl fullWidth size="small">
              <InputLabel id="ord-act-label">Тип действия</InputLabel>
              <Select
                labelId="ord-act-label"
                label="Тип действия"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
              >
                <MenuItem value="">
                  <em>Не указано</em>
                </MenuItem>
                {ORD_CONTRACT_ACTION_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="ord-subj-label">Предмет договора</InputLabel>
              <Select
                labelId="ord-subj-label"
                label="Предмет договора"
                value={subjectType}
                onChange={(e) => setSubjectType(e.target.value)}
              >
                <MenuItem value="">
                  <em>Не указано</em>
                </MenuItem>
                {ORD_CONTRACT_SUBJECT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2">Флаги</Typography>
            <FormGroup>
              {FLAG_OPTIONS.map((f) => (
                <FormControlLabel
                  key={f.value}
                  control={<Checkbox checked={flags.includes(f.value)} onChange={() => toggleFlag(f.value)} />}
                  label={f.label}
                />
              ))}
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleSubmitCreate}
            disabled={!ambassadorRoomId || isCreatePending}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
