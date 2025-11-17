import { Button, Stack } from "@mui/material";

interface CreateRoomButtonProps {
  onClick: () => void;
}

export const CreateRoomButton = ({ onClick }: CreateRoomButtonProps) => {
  return (
    <Stack direction="row" justifyContent="flex-start" mb={1}>
      <Button
        onClick={onClick}
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        Создать комнату
      </Button>
    </Stack>
  );
};

