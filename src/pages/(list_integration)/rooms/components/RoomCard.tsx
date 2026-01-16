import { ListItem, ListItemButton, ListItemText, IconButton } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import type { IRoomData } from "@services/rooms/rooms.types";
import { PRIMARY_COLOR } from "@/constants/colors";

interface RoomCardProps {
  room: IRoomData;
}

export const RoomCard = ({ room }: RoomCardProps) => {
  return (
    <ListItem 
      disablePadding 
      sx={{ 
        mb: 1.5, 
        borderRadius: 1, 
        border: "1px solid #e0e0e0",
        overflow: "hidden",
        backgroundColor: "white",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: PRIMARY_COLOR,
        }
      }}
    >
      <ListItemButton 
        component={Link} 
        to={`/rooms/${room.id}`} 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          py: 1.5,
          px: 2
        }}
      >
        <ListItemText 
          primary={room.name} 
          primaryTypographyProps={{ 
            variant: "body2",
            fontWeight: 400 
          }} 
        />
        <IconButton edge="end" size="small" sx={{ ml: 1, color: PRIMARY_COLOR }}>
          <EditIcon fontSize="small" />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
};

