import { Box, Alert, Button } from "@mui/material";

interface CreativeTasksErrorStateProps {
  errorMessage?: string;
}

export function CreativeTasksErrorState({ errorMessage }: CreativeTasksErrorStateProps) {
  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Alert severity="error" sx={{ mb: 3 }}>
        Ошибка при загрузке задач: {errorMessage ?? "Неизвестная ошибка"}
      </Alert>
      <Button variant="outlined" onClick={() => window.location.reload()}>
        Попробовать снова
      </Button>
    </Box>
  );
}
