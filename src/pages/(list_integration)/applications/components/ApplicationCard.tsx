import { Box, Typography, Button, Chip } from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import type { IRoomApplication, IEventApplication } from "@services/ambassador/ambassador.types";
import { PRIMARY_COLOR } from "@/constants/colors";

interface ApplicationCardProps {
  application: IRoomApplication | IEventApplication;
  type: 'room' | 'event';
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessedThis: boolean;
  showActions?: boolean;
  eventName?: string; // For event applications
  ambassadorName?: string; // For event applications
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getJuridicalTypeLabel = (type: string) => {
  switch (type) {
    case 'physical': return 'Физ. лицо';
    case 'ip': return 'ИП';
    case 'juridical': return 'Юр. лицо';
    default: return type;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Ожидает';
    case 'approved': return 'Одобрено';
    case 'rejected': return 'Отклонено';
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'error';
    default: return 'default';
  }
};

export const ApplicationCard = ({
  application,
  type,
  onApprove,
  isProcessedThis,
  onReject,
  showActions = true,
  eventName,
  ambassadorName
}: ApplicationCardProps) => {
  const isRoomApplication = type === 'room';
  const isEventApplication = type === 'event';
  const roomApp = application as IRoomApplication;

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        p: 2,
        backgroundColor: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          {isRoomApplication && roomApp.name && (
            <Typography variant="body1" fontWeight={500}>
              {roomApp.name}
            </Typography>
          )}
          {isEventApplication && eventName && (
            <Typography variant="body1" fontWeight={500}>
              {eventName}
            </Typography>
          )}
          {isRoomApplication && roomApp.juridicalType && (
            <Chip 
              label={getJuridicalTypeLabel(roomApp.juridicalType)} 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
          <Chip 
            label={getStatusLabel(application.status)} 
            size="small" 
            color={getStatusColor(application.status) as 'warning' | 'success' | 'error' | 'default'}
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {isRoomApplication && roomApp.phone && (
            <Typography variant="body2" color="text.secondary">
              Телефон: {roomApp.phone}
            </Typography>
          )}
          {isRoomApplication && roomApp.inn && (
            <Typography variant="body2" color="text.secondary">
              ИНН: {roomApp.inn}
            </Typography>
          )}
          {isEventApplication && (
            <Typography variant="body2" color="text.secondary">
              Амбассадор: {ambassadorName || application.ambassadorId}
            </Typography>
          )}
          {isRoomApplication && (
            <Typography variant="body2" color="text.secondary">
              ID амбассадора: {application.ambassadorId}
            </Typography>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Создано: {formatDate(application.createdAt)}
        </Typography>
      </Box>

      {showActions && (
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Check />}
            onClick={() => onApprove(application.id)}
            disabled={isProcessedThis}
            sx={{
              backgroundColor: PRIMARY_COLOR,
              "&:hover": {
                backgroundColor: PRIMARY_COLOR,
                opacity: 0.9
              }
            }}
          >
            {isProcessedThis ? 'Загрузка...' : 'Одобрить'}
          </Button>
          {
            isRoomApplication && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Close />}
                onClick={() => onReject(application.id)}
                disabled={isProcessedThis}
              >
                {isProcessedThis ? '...' : 'Отклонить'}
              </Button>
            )
          }
        </Box>
      )}
    </Box>
  );
};
