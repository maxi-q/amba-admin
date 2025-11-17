import { Box, Paper, Stack, TextField, Typography, IconButton, List, ListItem, Link as MuiLink } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface SubscriberGroupCardProps {
  title: string;
  name: string;
  senlerId: number;
  link: string;
  instructions: string[];
  onCopy: (link: string) => void;
}

export const SubscriberGroupCard = ({
  title,
  name,
  senlerId,
  link,
  instructions,
  onCopy,
}: SubscriberGroupCardProps) => {
  return (
    <Paper sx={{ borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>{title}</Typography>

      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: "grey.200", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20 }}>
          VK
        </Box>
        <Box>
          <Typography variant="body1" fontWeight={500}>{name}</Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {senlerId}{" "}
            <MuiLink href="#" underline="hover">
              перейти к редактированию
            </MuiLink>
          </Typography>
        </Box>
      </Stack>

      <List sx={{ mb: 2, ml: 2, listStyleType: 'decimal', pl: 2 }}>
        {instructions.map((txt, idx) => (
          <ListItem key={idx} sx={{ display: 'list-item', py: 0, px: 0, fontSize: 14, lineHeight: 1.5 }}>
            {txt}
          </ListItem>
        ))}
      </List>

      <Stack direction="row" alignItems="center" spacing={1}>
        <TextField
          value={link}
          InputProps={{ readOnly: true }}
          size="small"
          fullWidth
        />
        <IconButton
          onClick={() => onCopy(link)}
          title="Копировать"
          color="primary"
          sx={{ ml: 1 }}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
};

