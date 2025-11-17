import { Box, Alert, Button } from "@mui/material";

interface EventErrorStateProps {
  eventsError?: string;
  projectError?: string;
}

export const EventErrorState = ({ eventsError, projectError }: EventErrorStateProps) => {
  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      {eventsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Ошибка при загрузке событий: {eventsError}
        </Alert>
      )}
      {projectError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Ошибка при загрузке проекта: {projectError}
        </Alert>
      )}
      <Button
        variant="outlined"
        onClick={() => window.location.reload()}
      >
        Попробовать снова
      </Button>
    </Box>
  );
};

