import { ListItem, ListItemButton, ListItemText, IconButton } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import type { IRoomData } from "@services/rooms/rooms.types";

interface RoomCardProps {
  room: IRoomData;
}

export const RoomCard = ({ room }: RoomCardProps) => {
  return (
    <ListItem disablePadding sx={{ mb: 2, borderRadius: 3, boxShadow: 1, border: 1, overflow: "hidden" }}>
      <ListItemButton component={Link} to={`/rooms/${room.id}`} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <ListItemText primary={room.name} />
        <IconButton edge="end" size="small" sx={{ ml: 1 }}>
          <EditIcon fontSize="small" />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
};

