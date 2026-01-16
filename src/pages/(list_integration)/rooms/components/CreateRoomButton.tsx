import { Button, Stack } from "@mui/material";
import { PRIMARY_COLOR } from "@/constants/colors";

interface CreateRoomButtonProps {
  onClick: () => void;
}

export const CreateRoomButton = ({ onClick }: CreateRoomButtonProps) => {
  return (
    <Stack direction="row" justifyContent="flex-start" mb={2}>
      <Button
        onClick={onClick}
        variant="contained"
        sx={{ 
          mt: 2,
          backgroundColor: PRIMARY_COLOR,
          "&:hover": {
            backgroundColor: PRIMARY_COLOR,
            opacity: 0.9
          }
        }}
      >
        Создать комнату
      </Button>
    </Stack>
  );
};

