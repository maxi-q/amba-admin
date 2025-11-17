import { Box, Typography } from "@mui/material";

export const SettingsLoadingState = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
      <Typography>Загрузка...</Typography>
    </Box>
  );
};

