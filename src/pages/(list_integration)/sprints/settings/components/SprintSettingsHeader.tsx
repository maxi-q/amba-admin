import { Box, Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";

interface SprintSettingsHeaderProps {
  activeSprints: number;
  totalSprints: number;
}

export const SprintSettingsHeader = ({ activeSprints, totalSprints }: SprintSettingsHeaderProps) => {
  const { slug } = useParams();

  return (
    <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
        <MuiLink component={Link} to={`/rooms/${slug}/sprints`} underline="hover" color="inherit">
          Список спринтов
        </MuiLink>
        <Typography variant="body2" color="text.primary">
          Настройки спринтов
        </Typography>
      </Breadcrumbs>
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

