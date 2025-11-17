import { Box, Button } from "@mui/material";

interface CreateSprintButtonProps {
  onClick: () => void;
}

export const CreateSprintButton = ({ onClick }: CreateSprintButtonProps) => {
  return (
    <Box display="flex" justifyContent="flex-end">
      <Button
        variant="outlined"
        sx={{
          bgcolor: 'success.50',
          borderColor: 'success.200',
          color: 'success.700',
          '&:hover': {
            bgcolor: 'success.100',
            borderColor: 'success.300',
          },
        }}
        onClick={onClick}
      >
        Добавить спринт
      </Button>
    </Box>
  );
};

