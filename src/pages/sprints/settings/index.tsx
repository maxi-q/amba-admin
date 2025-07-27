import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Stack,
  IconButton,
  Link as MuiLink,
  List,
  ListItem,
  Breadcrumbs,
} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import type { IRoomData } from "@/pages";

export default function SprintSettingsPage() {
  const roomData = useOutletContext<IRoomData>();

  const { slug } = useParams();
  console.log(slug);

  const groups = roomData.groups;

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      alert("Ссылка скопирована в буфер обмена!");
    });
  };

  return (
    <Box maxWidth={900} mx="auto" p={3}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
          <MuiLink component={Link} to={`/rooms/${slug}/sprints`} underline="hover" color="inherit">
            Список спринтов
          </MuiLink>
          <Typography variant="body2" color="text.primary">
            Настройки спринтов
          </Typography>
        </Breadcrumbs>
      </Box>
      <Stack spacing={3}>
        {groups.map((group) => (
          <Paper key={group.id} elevation={1} sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>{group.title}</Typography>

            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: "grey.200", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20 }}>
                VK
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={500}>{group.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {group.senlerId}{" "}
                  <MuiLink href="#" underline="hover">
                    перейти к редактированию
                  </MuiLink>
                </Typography>
              </Box>
            </Stack>

            <List sx={{ mb: 2, ml: 2, listStyleType: 'decimal', pl: 2 }}>
              {group.instructions.map((txt, idx) => (
                <ListItem key={idx} sx={{ display: 'list-item', py: 0, px: 0, fontSize: 14, lineHeight: 1.5 }}>
                  {txt}
                </ListItem>
              ))}
            </List>

            <Stack direction="row" alignItems="center" spacing={1}>
              <TextField
                value={group.link}
                InputProps={{ readOnly: true }}
                size="small"
                fullWidth
              />
              <IconButton
                onClick={() => handleCopy(group.link)}
                title="Копировать"
                color="primary"
                sx={{ ml: 1 }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
