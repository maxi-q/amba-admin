import { Box, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

interface EventsHeaderProps {
  /** Ссылка на страницу с подробной информацией */
  infoLink: string;
}

/**
 * Заголовок страницы со списком событий
 * Отображает название страницы и ссылку на подробную информацию
 */
export const EventsHeader = ({ infoLink }: EventsHeaderProps) => {
  return (
    <Stack direction="row" alignItems="center" mb={3}>
      <Typography variant="h6" fontWeight={700} mb={0}>
        Список событий
      </Typography>
      <Box flex={1} />
      <Link to={infoLink} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
        подробнее
      </Link>
    </Stack>
  );
};

