import { Alert, Snackbar } from "@mui/material";

interface EventNotificationsProps {
  showCopySuccess: boolean;
  showCopyError: boolean;
  showPrefixError: boolean;
  eventId?: string;
  prefix?: string;
  onCloseCopySuccess: () => void;
  onCloseCopyError: () => void;
  onClosePrefixError: () => void;
}

export const EventNotifications = ({
  showCopySuccess,
  showCopyError,
  showPrefixError,
  eventId,
  prefix,
  onCloseCopySuccess,
  onCloseCopyError,
  onClosePrefixError,
}: EventNotificationsProps) => {
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
          Браузер запретил копирование, но вы можете сделать это вручную: {eventId}
        </Alert>
      </Snackbar>

      <Snackbar
        open={showPrefixError}
        autoHideDuration={5000}
        onClose={onClosePrefixError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={onClosePrefixError} severity="error" sx={{ width: '100%', cursor: 'pointer' }}>
          Префикс "{prefix}" уже занят. Пожалуйста, выберите другой префикс.
        </Alert>
      </Snackbar>
    </>
  );
};

