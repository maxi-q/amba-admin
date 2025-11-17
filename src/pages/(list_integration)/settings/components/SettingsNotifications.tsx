import { Alert, Snackbar } from "@mui/material";

interface SettingsNotificationsProps {
  showSaveSuccess: boolean;
  showCopySuccess: boolean;
  onCloseSaveSuccess: () => void;
  onCloseCopySuccess: () => void;
}

export const SettingsNotifications = ({
  showSaveSuccess,
  showCopySuccess,
  onCloseSaveSuccess,
  onCloseCopySuccess,
}: SettingsNotificationsProps) => {
  return (
    <>
      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={onCloseSaveSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={onCloseSaveSuccess} severity="success" sx={{ width: '100%' }}>
          Настройки успешно сохранены
        </Alert>
      </Snackbar>

      <Snackbar
        open={showCopySuccess}
        autoHideDuration={2000}
        onClose={onCloseCopySuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={onCloseCopySuccess} severity="info" sx={{ width: '100%', cursor: 'pointer' }}>
          Скопировано
        </Alert>
      </Snackbar>
    </>
  );
};

