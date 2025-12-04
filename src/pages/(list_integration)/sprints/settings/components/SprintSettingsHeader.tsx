import { Box, Typography } from "@mui/material";

interface SprintSettingsHeaderProps {
  activeSprints: number;
  totalSprints: number;
}

export const SprintSettingsHeader = ({ activeSprints, totalSprints }: SprintSettingsHeaderProps) => {
  return (
    <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="body2" color="text.secondary">
          Активных спринтов: {activeSprints}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Всего спринтов: {totalSprints}
        </Typography>
      </Box>
    </Box>
  );
};

