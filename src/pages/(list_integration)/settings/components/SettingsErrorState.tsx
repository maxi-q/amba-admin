import { Box, Alert } from "@mui/material";

interface SettingsErrorStateProps {
  errorMessage?: string;
}

export const SettingsErrorState = ({ errorMessage }: SettingsErrorStateProps) => {
  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Alert severity="error">
        Ошибка при загрузке комнаты: {errorMessage || 'Неизвестная ошибка'}
      </Alert>
    </Box>
  );
};

