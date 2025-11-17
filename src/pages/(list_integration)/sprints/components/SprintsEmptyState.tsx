import { Box, Typography } from "@mui/material";

export const SprintsEmptyState = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="body1" color="text.secondary" mb={2}>
        Спринтов пока нет
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Создайте первый спринт, чтобы начать работу
      </Typography>
    </Box>
  );
};

