import { Box, Button } from "@mui/material";
import { PRIMARY_COLOR } from "@/constants/colors";

interface CreateCreativeTaskButtonProps {
  onClick: () => void;
}

export function CreateCreativeTaskButton({ onClick }: CreateCreativeTaskButtonProps) {
  return (
    <Box display="flex" justifyContent="flex-end">
      <Button
        variant="contained"
        onClick={onClick}
        sx={{
          backgroundColor: PRIMARY_COLOR,
          "&:hover": {
            backgroundColor: PRIMARY_COLOR,
            opacity: 0.9
          }
        }}
      >
        Создать задачу
      </Button>
    </Box>
  );
}
