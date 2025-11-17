import { Box, Alert } from "@mui/material";

interface SprintSettingsErrorStateProps {
  roomError?: string;
  sprintsError?: string;
  projectError?: string;
}

export const SprintSettingsErrorState = ({ roomError, sprintsError, projectError }: SprintSettingsErrorStateProps) => {
  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      {roomError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка при загрузке комнаты: {roomError}
        </Alert>
      )}
      {sprintsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка при загрузке спринтов: {sprintsError}
        </Alert>
      )}
      {projectError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка при загрузке проекта: {projectError}
        </Alert>
      )}
    </Box>
  );
};

