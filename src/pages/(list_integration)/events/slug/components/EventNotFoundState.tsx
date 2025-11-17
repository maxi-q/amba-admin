import { Box, Alert } from "@mui/material";

export const EventNotFoundState = () => {
  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Alert severity="warning" sx={{ mb: 3 }}>
        Событие не найдено
      </Alert>
    </Box>
  );
};

