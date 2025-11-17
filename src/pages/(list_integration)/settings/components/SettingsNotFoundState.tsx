import { Box, Alert } from "@mui/material";

export const SettingsNotFoundState = () => {
  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Alert severity="warning">
        Комната не найдена
      </Alert>
    </Box>
  );
};

