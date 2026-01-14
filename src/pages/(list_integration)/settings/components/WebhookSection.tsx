import {
  Typography,
  TextField,
  Box,
  Button,
  IconButton,
  Link,
} from "@mui/material";
import { Refresh, ContentCopy } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { getFirstFieldError, hasFieldError } from "@services/config/axios.helper";
import { PRIMARY_COLOR } from "@/constants/colors";

interface WebhookSectionProps {
  webhookUrl: string;
  secretKey: string;
  slug?: string;
  fieldErrors?: Record<string, string[]>;
  isUpdating: boolean;
  isRotating: boolean;
  onWebhookUrlChange: (value: string) => void;
  onSaveWebhook: () => void;
  onCopySecretKey: () => void;
  onRotateSecretKey: () => void;
}

export const WebhookSection = ({
  webhookUrl,
  secretKey,
  slug,
  fieldErrors,
  isUpdating,
  isRotating,
  onWebhookUrlChange,
  onSaveWebhook,
  onCopySecretKey,
  onRotateSecretKey,
}: WebhookSectionProps) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" mb={2}>Вебхук</Typography>
      
      <Typography variant="subtitle2" mb={1.5}>
        Адрес:
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          value={webhookUrl}
          onChange={(e) => onWebhookUrlChange(e.target.value)}
          size="medium"
          variant="outlined"
          error={hasFieldError(fieldErrors || {}, 'webhookUrl')}
          helperText={getFirstFieldError(fieldErrors || {}, 'webhookUrl')}
        />
        <Button
          variant="contained"
          onClick={onSaveWebhook}
          disabled={isUpdating}
          sx={{ 
            minWidth: 120,
            backgroundColor: PRIMARY_COLOR,
            "&:hover": {
              backgroundColor: PRIMARY_COLOR,
              opacity: 0.9
            }
          }}
        >
          {isUpdating ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={3}>
        На этот адрес будут отправляться запросы после того как привлеченный пользователь активировал промокод
      </Typography>

      <Typography variant="subtitle2" mb={1.5}>
        Секретный ключ
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          value={secretKey || ''}
          size="medium"
          variant="outlined"
          type="password"
          InputProps={{
            readOnly: true,
            endAdornment: (
                <IconButton
                    onClick={onCopySecretKey}
                    size="small"
                    sx={{ mr: 0.5, color: PRIMARY_COLOR }}
                  >
                    <ContentCopy />
                  </IconButton>
            )
          }}
        />
        <IconButton 
          onClick={onRotateSecretKey} 
          disabled={isRotating}
          sx={{ color: PRIMARY_COLOR }}
        >
          <Refresh sx={{ 
            animation: isRotating ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} />
        </IconButton>
      </Box>

      <Link
        component={RouterLink}
        to={`/rooms/${slug}/setting/info`}
        underline="hover"
        sx={{ cursor: 'pointer', color: PRIMARY_COLOR }}
      >
        описание формата вебхука
      </Link>
    </Box>
  );
};

