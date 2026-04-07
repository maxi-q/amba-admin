import { Stack, Typography } from "@mui/material";

export function InvitationsHeader() {
  return (
    <Stack direction="row" alignItems="center" mb={3}>
      <Typography variant="h6" fontWeight={700} mb={0}>
        Приглашения
      </Typography>
    </Stack>
  );
}
