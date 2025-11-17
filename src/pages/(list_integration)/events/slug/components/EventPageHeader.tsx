import { Box, Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";

interface EventPageHeaderProps {
  eventName?: string;
  onCopyEventId: () => void;
}

export const EventPageHeader = ({ eventName, onCopyEventId }: EventPageHeaderProps) => {
  const { eventId, slug } = useParams();
  const isNewEvent = eventId === 'new';

  return (
    <Box mb={3} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
        <MuiLink component={Link} to={`/rooms/${slug}/events`} underline="hover" color="inherit">
          Список событий
        </MuiLink>
        <Typography variant="body2" color="text.primary">
          {isNewEvent ? 'Новое событие' : eventName}
        </Typography>
      </Breadcrumbs>
      {!isNewEvent && (
        <MuiLink
          variant="body2"
          underline="always"
          color="inherit"
          sx={{
            userSelect: "none",
            cursor: "pointer"
          }}
          onClick={onCopyEventId}
        >
          Скопировать ID события
        </MuiLink>
      )}
    </Box>
  );
};

