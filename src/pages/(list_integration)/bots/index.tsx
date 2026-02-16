import { Box, Typography, Card, CardContent, Avatar, Stack, Alert } from "@mui/material";
import { useGetBots } from "@/hooks/projects/useGetBots";
import { SettingsLoadingState } from "../settings/components/SettingsLoadingState";
import { SettingsErrorState } from "../settings/components/SettingsErrorState";
import type { IBotItem } from "@services/projects/projects.types";
import { PRIMARY_COLOR } from "@/constants/colors";

function BotCard({ bot }: { bot: IBotItem }) {
  return (
    <Card
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        transition: "all 0.2s",
        "&:hover": {
          borderColor: PRIMARY_COLOR,
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 48, height: 48 }}>
            {bot.title?.charAt(0) ?? "?"}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={500}>
              {bot.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {bot.bot_id}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {bot.date} · {bot.active === "1" ? "Активен" : "Неактивен"} ·{" "}
              {bot.published === "1" ? "Опубликован" : "Черновик"}
            </Typography>
            {bot.tags?.length > 0 && (
              <Typography variant="caption" color="text.secondary" display="block">
                Теги: {bot.tags.join(", ")}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function BotsPage() {
  const { bots, isLoading, isError, error } = useGetBots();

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <SettingsLoadingState />
      </Box>
    );
  }

  if (isError) {
    return (
      <SettingsErrorState
        errorMessage={(error as Error)?.message ?? "Не удалось загрузить список ботов"}
      />
    );
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
        Боты
      </Typography>

      {!bots?.length ? (
        <Alert severity="info">Нет доступных ботов</Alert>
      ) : (
        <Stack spacing={2}>
          {bots.map((bot) => (
            <BotCard key={bot.bot_id} bot={bot} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
