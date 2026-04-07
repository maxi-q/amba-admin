import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Alert,
  IconButton,
  Pagination,
  Autocomplete,
  Chip,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { useCreativeTaskWhitelist } from "@/hooks/creativetasks/useCreativeTaskWhitelist";
import { useAddToCreativeTaskWhitelist } from "@/hooks/creativetasks/useAddToCreativeTaskWhitelist";
import { useRemoveFromCreativeTaskWhitelist } from "@/hooks/creativetasks/useRemoveFromCreativeTaskWhitelist";
import { useAmbassadors } from "@/hooks/ambassador/useAmbassadors";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useParams } from "react-router-dom";
import { PRIMARY_COLOR } from "@/constants/colors";
import { Loader } from "@/components/Loader";
import type { ICreativeTask } from "@services/creativetasks/creativetasks.types";
import type { IAmbassador } from "@services/ambassador/ambassador.types";

interface CreativeTaskWhitelistSectionProps {
  task: ICreativeTask;
}

export function CreativeTaskWhitelistSection({ task }: CreativeTaskWhitelistSectionProps) {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [ambassadorIdInput, setAmbassadorIdInput] = useState("");
  const [selectedAmbassador, setSelectedAmbassador] = useState<IAmbassador | null>(null);

  const { room } = useGetRoomById(slug ?? "");

  const { items, isLoading, pagination } = useCreativeTaskWhitelist(task.id, {
    page,
    size: pageSize,
  });

  const {
    addToWhitelist,
    isPending: isAdding,
    generalError: addGeneralError,
    validationErrors: addValidationErrors,
  } = useAddToCreativeTaskWhitelist();

  const {
    removeFromWhitelist,
    isPending: isRemoving,
    generalError: removeGeneralError,
  } = useRemoveFromCreativeTaskWhitelist();

  const {
    ambassadors,
    isLoading: isLoadingAmbassadors,
  } = useAmbassadors({
    page: 1,
    size: 100,
    roomIds: room?.id ? ([room.id] as unknown as number[]) : undefined,
  });

  const ambassadorOptions = useMemo(() => ambassadors ?? [], [ambassadors]);

  const promoByAmbassadorId = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of ambassadorOptions) {
      if (a.id) m.set(a.id, a.promoCode);
    }
    return m;
  }, [ambassadorOptions]);

  const handleAddById = () => {
    const id = ambassadorIdInput.trim();
    if (!id) return;
    addToWhitelist({
      taskId: task.id,
      data: { ambassadorId: id },
    });
    setAmbassadorIdInput("");
  };

  const handleAddSelected = () => {
    if (!selectedAmbassador?.id) return;
    addToWhitelist({
      taskId: task.id,
      data: { ambassadorId: selectedAmbassador.id },
    });
    setSelectedAmbassador(null);
  };

  const handleRemove = (ambassadorId: string) => {
    removeFromWhitelist({ taskId: task.id, ambassadorId });
  };

  const whitelistDisabled = task.isWhitelistEnabled === false;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        Вайтлист
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Только амбассадоры из списка могут участвовать в задании, если включён вайтлист в настройках задачи.
      </Typography>

      {whitelistDisabled && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Вайтлист для этой задачи отключён. Включите «Вайтлист» в настройках задачи при редактировании.
        </Alert>
      )}

      {(addGeneralError || removeGeneralError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {addGeneralError || removeGeneralError}
        </Alert>
      )}

      <Stack spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Добавить по ID амбассадора (UUID)
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="flex-start">
            <TextField
              size="small"
              fullWidth
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={ambassadorIdInput}
              onChange={(e) => setAmbassadorIdInput(e.target.value)}
              error={!!addValidationErrors?.ambassadorId?.length}
              helperText={addValidationErrors?.ambassadorId?.[0]}
              disabled={whitelistDisabled}
            />
            <Button
              variant="contained"
              onClick={handleAddById}
              disabled={whitelistDisabled || isAdding || !ambassadorIdInput.trim()}
              sx={{
                backgroundColor: PRIMARY_COLOR,
                "&:hover": { backgroundColor: PRIMARY_COLOR, opacity: 0.9 },
                whiteSpace: "nowrap",
              }}
            >
              {isAdding ? "…" : "Добавить"}
            </Button>
          </Stack>
        </Box>

        {room?.id && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Или выберите амбассадора комнаты
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="flex-start">
              <Autocomplete
                size="small"
                fullWidth
                options={ambassadorOptions}
                loading={isLoadingAmbassadors}
                getOptionLabel={(o) =>
                  o.promoCode ? `${o.promoCode} (${o.id.slice(0, 8)}…)` : o.id
                }
                value={selectedAmbassador}
                onChange={(_, v) => setSelectedAmbassador(v)}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                disabled={whitelistDisabled}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Поиск по промокоду / id" />
                )}
              />
              <Button
                variant="outlined"
                onClick={handleAddSelected}
                disabled={whitelistDisabled || isAdding || !selectedAmbassador}
                sx={{ whiteSpace: "nowrap" }}
              >
                Добавить
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <Loader />
        </Box>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          В вайтлисте пока никого нет.
        </Typography>
      ) : (
        <>
          <Stack spacing={1}>
            {items.map((row) => {
              const promo =
                row.promoCode?.trim() ||
                promoByAmbassadorId.get(row.ambassadorId) ||
                "—";
              return (
              <Box
                key={row.ambassadorId}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  py: 1,
                  px: 1.5,
                  borderRadius: 1,
                  bgcolor: "grey.50",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="baseline" spacing={1} flexWrap="wrap" useFlexGap>
                    <Typography variant="body2" color="text.secondary" component="span">
                      Промокод:
                    </Typography>
                    <Chip
                      label={promo}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      fontFamily: "monospace",
                      wordBreak: "break-all",
                    }}
                  >
                    ID: {row.ambassadorId}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  aria-label="Убрать из вайтлиста"
                  onClick={() => handleRemove(row.ambassadorId)}
                  disabled={whitelistDisabled || isRemoving}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            );
            })}
          </Stack>

          {pagination && pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
                size="small"
                sx={{
                  "& .MuiPaginationItem-root.Mui-selected": {
                    backgroundColor: PRIMARY_COLOR,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}
