import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Stack,
  Alert,
  Button,
} from "@mui/material";
import { useGetBots } from "@/hooks/projects/useGetBots";
import { useUpdateRoom } from "@/hooks/rooms/useUpdateRoom";
import type { IBotItem } from "@services/projects/projects.types";
import type { IGetRoomByIdResponse } from "@services/rooms/rooms.types";
import { PRIMARY_COLOR } from "@/constants/colors";
import { useEffect, useState } from "react";

function filterBots(bots: IBotItem[], input: string): IBotItem[] {
  if (!input.trim()) return bots.slice(0, 20);
  const lower = input.toLowerCase().trim();
  return bots.filter(
    (bot) =>
      bot.title.toLowerCase().includes(lower) ||
      bot.bot_id.toLowerCase().includes(lower)
  );
}

interface SettingsBotsSectionProps {
  slug: string;
  room: IGetRoomByIdResponse | undefined;
  onSaveSuccess?: () => void;
}

export function SettingsBotsSection({ slug, room, onSaveSuccess }: SettingsBotsSectionProps) {
  const { bots, isLoading: isLoadingBots } = useGetBots();
  const { updateRoom, isPending: isUpdating, isSuccess, generalError } = useUpdateRoom();

  const [approvedBot, setApprovedBot] = useState<IBotItem | null>(null);
  const [rejectedBot, setRejectedBot] = useState<IBotItem | null>(null);

  useEffect(() => {
    if (!room || !bots.length) return;
    const approvedId = room.notificationCreativeTaskApprovedBotId;
    const rejectedId = room.notificationCreativeTaskRejectedBotId;
    setApprovedBot(bots.find((b) => b.bot_id === approvedId) ?? null);
    setRejectedBot(bots.find((b) => b.bot_id === rejectedId) ?? null);
  }, [room, bots]);

  useEffect(() => {
    if (isSuccess) onSaveSuccess?.();
  }, [isSuccess, onSaveSuccess]);

  const handleSave = () => {
    updateRoom({
      data: {
        notificationCreativeTaskApprovedBotId: approvedBot?.bot_id ?? undefined,
        notificationCreativeTaskRejectedBotId: rejectedBot?.bot_id ?? undefined,
      },
      id: slug,
    });
  };

  const getOptionLabel = (bot: IBotItem) => `${bot.title} (${bot.bot_id})`;

  return (
    <Box component="section" sx={{ mt: 4, pt: 3, borderTop: "1px solid #e0e0e0" }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
        Боты уведомлений
      </Typography>

      <Stack spacing={3} sx={{ maxWidth: 480 }}>
        <Box>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
            Бот при одобрении креативной задачи
          </Typography>
          <Autocomplete<IBotItem>
            value={approvedBot}
            onChange={(_, newValue) => setApprovedBot(newValue)}
            options={bots}
            getOptionLabel={getOptionLabel}
            filterOptions={(options, { inputValue }) =>
              filterBots(options, inputValue)
            }
            isOptionEqualToValue={(opt, val) => opt.bot_id === val.bot_id}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Поиск по названию или ID"
              />
            )}
            noOptionsText="Введите название или ID бота"
            loading={isLoadingBots}
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
            Бот при отклонении креативной задачи
          </Typography>
          <Autocomplete<IBotItem>
            value={rejectedBot}
            onChange={(_, newValue) => setRejectedBot(newValue)}
            options={bots}
            getOptionLabel={getOptionLabel}
            filterOptions={(options, { inputValue }) =>
              filterBots(options, inputValue)
            }
            isOptionEqualToValue={(opt, val) => opt.bot_id === val.bot_id}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Поиск по названию или ID"
              />
            )}
            noOptionsText="Введите название или ID бота"
            loading={isLoadingBots}
          />
        </Box>

        {generalError && (
          <Alert severity="error">
            {generalError}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isUpdating}
          sx={{
            alignSelf: "flex-start",
            backgroundColor: PRIMARY_COLOR,
            "&:hover": { backgroundColor: PRIMARY_COLOR, opacity: 0.9 },
          }}
        >
          {isUpdating ? "Сохранение…" : "Сохранить"}
        </Button>
      </Stack>

      {!bots?.length && !isLoadingBots && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Нет доступных ботов для выбора.
        </Alert>
      )}
    </Box>
  );
}
