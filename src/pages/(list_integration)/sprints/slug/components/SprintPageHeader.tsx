import { Box, Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";

interface SprintPageHeaderProps {
  sprintName?: string;
  onCopySprintId: () => void;
}

export const SprintPageHeader = ({ sprintName, onCopySprintId }: SprintPageHeaderProps) => {
  const { sprintId, slug } = useParams();
  const isNewSprint = sprintId === 'new';

  return (
    <Box mb={3} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
        <MuiLink component={Link} to={`/rooms/${slug}/sprints`} underline="hover" color="inherit">
          Список спринтов
        </MuiLink>
        <Typography variant="body2" color="text.primary">
          {isNewSprint ? 'Новый спринт' : sprintName}
        </Typography>
      </Breadcrumbs>
      {!isNewSprint && (
        <MuiLink
          variant="body2"
          underline="always"
          color="inherit"
          sx={{
            userSelect: "none",
            cursor: "pointer"
          }}
          onClick={onCopySprintId}
        >
          Скопировать ID спринта
        </MuiLink>
      )}
    </Box>
  );
};

