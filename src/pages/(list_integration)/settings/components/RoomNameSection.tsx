import { Box, TextField, Typography } from "@mui/material";
import { getFirstFieldError, hasFieldError } from "@services/config/axios.helper";

interface RoomNameSectionProps {
  roomName: string;
  onChange: (value: string) => void;
  fieldErrors?: Record<string, string[]>;
}

export const RoomNameSection = ({ roomName, onChange, fieldErrors }: RoomNameSectionProps) => {
  return (
    <Box mb={4}>
      <Typography variant="subtitle2" mb={1.5}>
        Название:
      </Typography>
      <TextField
        fullWidth
        value={roomName}
        onChange={(e) => onChange(e.target.value)}
        size="medium"
        variant="outlined"
        error={hasFieldError(fieldErrors || {}, 'name')}
        helperText={getFirstFieldError(fieldErrors || {}, 'name')}
      />
    </Box>
  );
};

