import { Alert, Snackbar } from "@mui/material";

interface SprintNotificationsProps {
  showCopySuccess: boolean;
  showCopyError: boolean;
  showSaveSuccess: boolean;
  sprintId?: string;
  isNewSprint: boolean;
  onCloseCopySuccess: () => void;
  onCloseCopyError: () => void;
  onCloseSaveSuccess: () => void;
}

export const SprintNotifications = ({
  showCopySuccess,
  showCopyError,
  showSaveSuccess,
  sprintId,
  isNewSprint,
  onCloseCopySuccess,
  onCloseCopyError,
  onCloseSaveSuccess,
}: SprintNotificationsProps) => {
  return (
    <>
      <Snackbar
        open={showCopySuccess}
        autoHideDuration={3000}
        onClose={onCloseCopySuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={onCloseCopySuccess} severity="success" sx={{ width: '100%', cursor: 'pointer' }}>
          Скопировано
        </Alert>
      </Snackbar>

      <Snackbar
        open={showCopyError}
        autoHideDuration={5000}
        onClose={onCloseCopyError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={onCloseCopyError} severity="error" sx={{ width: '100%', cursor: 'pointer' }}>
          Браузер запретил копирование, но вы можете сделать это вручную: {sprintId}
        </Alert>
      </Snackbar>

      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={onCloseSaveSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={onCloseSaveSuccess} severity="success" sx={{ width: '100%' }}>
          {isNewSprint ? 'Спринт успешно создан' : 'Спринт успешно сохранен'}
        </Alert>
      </Snackbar>
    </>
  );
};

