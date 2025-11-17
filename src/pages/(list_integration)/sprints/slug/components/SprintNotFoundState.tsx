import { Box, Alert } from "@mui/material";

export const SprintNotFoundState = () => {
  return (
    <Box sx={{ px: 2, py: 3 }}>
      <Alert severity="error">
        Спринт не найден
      </Alert>
    </Box>
  );
};

