import { Stack, Typography } from "@mui/material";

/**
 * Заголовок страницы «Креативные задачи»
 */
export function CreativeTasksHeader() {
  return (
    <Stack direction="row" alignItems="center" mb={3}>
      <Typography variant="h6" fontWeight={700} mb={0}>
        Креативы
      </Typography>
    </Stack>
  );
}
