import { Link, useParams } from "react-router-dom";
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
  Alert,
  Snackbar,
} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useRoomDataStore } from "@store/index";
import { useSprints } from "@/hooks/sprints/useSprints";
import { Loader } from "@/components/Loader";
import projectsService from "@services/projects/projects.service";
import { useEffect, useState } from "react";

export default function SprintSettingsPage() {
  const { roomData, project, setProject } = useRoomDataStore();
  const { slug } = useParams();

  // Получаем список спринтов для отображения статистики
  const { 
    sprints, 
    isLoading: isLoadingSprints, 
    isError: isSprintsError, 
    error: sprintsError 
  } = useSprints(
    { page: 1, size: 100 },
    slug || ''
  );

  const [showCopyNotification, setShowCopyNotification] = useState(false);

  useEffect(() => {
    const getProjectData = async () => {
      if (!project) {
        try {
          const projectData = await projectsService.getProject();
          setProject(projectData.data);
        } catch (error) {
          console.error('Ошибка при загрузке проекта:', error);
        }
      }
    }

    getProjectData();
  }, [project, setProject]);

  // Показываем загрузку
  if (isLoadingSprints) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </Box>
    );
  }

  // Показываем ошибку
  if (isSprintsError) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Ошибка при загрузке спринтов: {sprintsError?.message || 'Неизвестная ошибка'}
        </Alert>
      </Box>
    );
  }

  if (!roomData) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="warning">
          Данные комнаты не найдены
        </Alert>
      </Box>
    );
  }


  const groups = [
    {
      id: 1,
      title: "Группа подписчиков в Senler для подачи заявки в амбассадорку",
      name: "Заявки амбассадоры: Конференция суровый маркетинг 2025",
      senlerId: 123456,
      link: `https://vk.com/app5898182_-${project?.channelExternalId}#s=${roomData.pendingSubscriptionId}&force=1`,
      instructions: [
        "Отправить прямую ссылку на группу подписчиков:",
        "Сделать рассылку через бота с предложением об участии и кнопкой \"Принять\" (при нажатии на которую вызвать действие добавления в группу)",
        "Самостоятельно добавить участников в группу подписчиков в кабинете Senler",
        "И так далее. Варианты ограничиваются только вашей фантазией…",
      ],
    },
    {
      id: 2,
      title: "Группа подписчиков в Senler для одобренных амбассадоров",
      name: "Одобренные амбассадоры: Конференция суровый маркетинг 2025",
      senlerId: 123456,
      link: `https://vk.com/app5898182_-${project?.channelExternalId}#s=${roomData.approvedSubscriptionId}&force=1`,
      instructions: [
        "Добавляйте в данную группу одобренных амбассадоров, чтобы они смогли принять участие.",
        "Если вы хотите принимать без амбассадоров без процесса одобрения, организуйте подписку на данную группу минуя группу с заявками.",
        "Прямая ссылка на вступление в данную группу минуя процесс одобрения:",
      ],
    },
    {
      id: 3,
      title: "Группа подписчиков в Senler для исключенных амбассадоров",
      name: "Исключенные амбассадоры: Конференция суровый маркетинг 2025",
      senlerId: 123456,
      link: `https://vk.com/app5898182_-${project?.channelExternalId}#s=${roomData.rejectedSubscriptionId}&force=1`,
      instructions: [
        "В данной группе можно сохранять исключенных амбассадоров, чтобы автоматически отключать их участие в комнате.",
        "Вступление будет отключаться из группы с заявками и одобренными амбассадорами.",
      ],
    },
  ]

  const handleCopy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setShowCopyNotification(true);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
    }
  };

  const handleCloseCopyNotification = () => {
    setShowCopyNotification(false);
  };

  // Статистика спринтов
  const activeSprints = sprints.filter(sprint => !sprint.isDeleted).length;
  const totalSprints = sprints.length;

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
          <MuiLink component={Link} to={`/rooms/${slug}/sprints`} underline="hover" color="inherit">
            Список спринтов
          </MuiLink>
          <Typography variant="body2" color="text.primary">
            Настройки спринтов
          </Typography>
        </Breadcrumbs>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">
            Активных спринтов: {activeSprints}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Всего спринтов: {totalSprints}
          </Typography>
        </Box>
      </Box>
      <Stack spacing={3}>
        {groups.map((group) => (
          <Paper key={group.id} sx={{ borderRadius: 3 }}>
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

      <Snackbar
        open={showCopyNotification}
        autoHideDuration={3000}
        onClose={handleCloseCopyNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCopyNotification} severity="success" sx={{ width: '100%' }}>
          Ссылка скопирована в буфер обмена
        </Alert>
      </Snackbar>
    </Box>
  );
}
