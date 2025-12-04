import { Box, Link as MuiLink } from "@mui/material";
import { useParams } from "react-router-dom";

interface SprintPageHeaderProps {
  sprintName?: string;
  onCopySprintId: () => void;
}

export const SprintPageHeader = ({ onCopySprintId }: SprintPageHeaderProps) => {
  const { sprintId } = useParams();
  const isNewSprint = sprintId === 'new';

  return (
    <Box mb={3} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
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

