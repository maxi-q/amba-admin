import { Box, Typography, Paper, Stack, IconButton, Chip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import type { IInvitation } from "@services/invitations/invitations.types";
import { PRIMARY_COLOR } from "@/constants/colors";

interface InvitationCardProps {
  invitation: IInvitation;
  resolveTaskLabel: (id: string) => string;
  resolveEventLabel: (id: string) => string;
  onEdit: (invitation: IInvitation) => void;
  onDelete: (invitation: IInvitation) => void;
}

function IdLine({
  label,
  ids,
  resolve,
}: {
  label: string;
  ids: string[];
  resolve: (id: string) => string;
}) {
  const safe = ids ?? [];
  if (safe.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {label}: —
      </Typography>
    );
  }
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5}>
        {safe.map((id) => (
          <Chip key={id} size="small" variant="outlined" label={resolve(id)} />
        ))}
      </Stack>
    </Box>
  );
}

export function InvitationCard({
  invitation,
  resolveTaskLabel,
  resolveEventLabel,
  onEdit,
  onDelete,
}: InvitationCardProps) {
  const vkTargets = invitation.targets ?? [];
  const taskIds = invitation.taskIds ?? [];
  const eventIds = invitation.eventIds ?? [];

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Подписчики ВК (subscriberId)
          </Typography>
          {vkTargets.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              —
            </Typography>
          ) : (
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5} sx={{ mt: 0.5 }}>
              {vkTargets.map((t, i) => (
                <Chip
                  key={`${t.subscriberId}-${i}`}
                  size="small"
                  variant="outlined"
                  label={t.subscriberId}
                  sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                />
              ))}
            </Stack>
          )}
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Создано: {new Date(invitation.createdAt).toLocaleString("ru-RU")}
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <IdLine label="Креативные задачи" ids={taskIds} resolve={resolveTaskLabel} />
            <IdLine label="События" ids={eventIds} resolve={resolveEventLabel} />
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" aria-label="Редактировать" onClick={() => onEdit(invitation)}>
            <EditIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
          </IconButton>
          <IconButton size="small" aria-label="Удалить" color="error" onClick={() => onDelete(invitation)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
}
