import { Box, Paper, Stack, TextField, Typography } from "@mui/material";
import type { IEvent } from "@services/events/events.types";

interface SubscriberGroupsSectionProps {
  event: IEvent;
  channelExternalId?: string;
}

export const SubscriberGroupsSection = ({ event, channelExternalId }: SubscriberGroupsSectionProps) => {
  const baseUrl = `https://vk.com/app5898182_-${channelExternalId}`;

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, border: 'none', boxShadow: 'none' }}>
      <Typography
        variant="h6"
        fontWeight={600}
        mb={2}
      >
        Группы подписчиков
      </Typography>

      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Box sx={{ width: 40, height: 40, borderRadius: "50%", border: "2px dashed #ccc" }} />
        <Box>
          <Typography variant="body1" fontWeight={500}>
            Группа подписчиков в Senler для подачи заявки участие в событии
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: 2353
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={1} mt={2}>
        <Typography variant="subtitle2" pb={0.5}>
          Ссылка для вступления в группу для подачи заявки:
        </Typography>
        <TextField
          value={`${baseUrl}#s=${event.pendingSubscriptionId}&force=1`}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
          size="small"
          sx={{ pb: 3 }}
        />
        <Typography variant="subtitle2" pb={0.5}>
          Ссылка для вступления в группу для одобренных участников:
        </Typography>
        <TextField
          value={`${baseUrl}#s=${event.approvedSubscriptionId}&force=1`}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
          size="small"
          sx={{ pb: 3 }}
        />
        <Typography variant="subtitle2" pt={0.5}>
          Ссылка для вступления в группу для исключенных участников:
        </Typography>
        <TextField
          value={`${baseUrl}#s=${event.rejectedSubscriptionId}&force=1`}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
          size="small"
        />
      </Stack>
    </Paper>
  );
};

