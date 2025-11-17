import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Box,
  Button,
  IconButton,
  Link,
} from "@mui/material";
import { ExpandMore, Refresh, ContentCopy } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { getFirstFieldError, hasFieldError } from "@services/config/axios.helper";

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
    <Accordion defaultExpanded sx={{ mb: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="webhook-content"
        id="webhook-header"
      >
        <Typography variant="h6">Вебхук</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
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
              color="primary"
              onClick={onSaveWebhook}
              disabled={isUpdating}
              sx={{ minWidth: 120 }}
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
                    color="primary"
                    size="small"
                    sx={{ mr: 0.5 }}
                  >
                    <ContentCopy />
                  </IconButton>
                )
              }}
            />
            <IconButton 
              onClick={onRotateSecretKey} 
              color="primary"
              disabled={isRotating}
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
            color="primary"
            sx={{ cursor: 'pointer' }}
          >
            описание формата вебхука
          </Link>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

