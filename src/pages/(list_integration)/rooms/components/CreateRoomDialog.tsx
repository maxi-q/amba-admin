import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Box,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { getFirstFieldError, hasFieldError } from "@services/config/axios.helper";
import { PRIMARY_COLOR } from "@/constants/colors";

interface CreateRoomDialogProps {
  open: boolean;
  formData: {
    name: string;
    webhookUrl: string;
  };
  fieldErrors: Record<string, string[]>;
  generalError: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onInputChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CreateRoomDialog = ({
  open,
  formData,
  fieldErrors,
  generalError,
  isPending,
  onClose,
  onSubmit,
  onInputChange,
}: CreateRoomDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          margin: 0,
          maxHeight: '100vh',
          maxWidth: '100vw',
          height: '100vh',
          width: '100vw',
          zIndex: 1300,
        }
      }}
    >
      <AppBar sx={{ position: 'relative', backgroundColor: PRIMARY_COLOR }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Создать новую комнату
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {generalError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {generalError}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Название комнаты"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={onInputChange('name')}
            error={hasFieldError(fieldErrors, 'name')}
            helperText={getFirstFieldError(fieldErrors, 'name')}
            sx={{ mb: 3 }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            size="large"
            sx={{ 
              borderColor: PRIMARY_COLOR, 
              color: PRIMARY_COLOR,
              "&:hover": {
                borderColor: PRIMARY_COLOR,
                backgroundColor: "rgba(66, 139, 202, 0.04)"
              }
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={!formData.name.trim() || isPending}
            size="large"
            sx={{ 
              backgroundColor: PRIMARY_COLOR,
              "&:hover": {
                backgroundColor: PRIMARY_COLOR,
                opacity: 0.9
              }
            }}
          >
            {isPending ? 'Создание...' : 'Создать'}
          </Button>
        </Box>
      </Container>
    </Dialog>
  );
};

