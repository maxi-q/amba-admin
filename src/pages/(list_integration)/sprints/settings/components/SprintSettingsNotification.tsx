import { Alert, Snackbar } from "@mui/material";

interface SprintSettingsNotificationProps {
  open: boolean;
  onClose: () => void;
}

export const SprintSettingsNotification = ({ open, onClose }: SprintSettingsNotificationProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity="success" sx={{ width: '100%' }}>
        Ссылка скопирована в буфер обмена
      </Alert>
    </Snackbar>
  );
};

