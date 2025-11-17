import { Box, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

interface SprintsHeaderProps {
  infoLink: string;
}

export const SprintsHeader = ({ infoLink }: SprintsHeaderProps) => {
  return (
    <Stack direction="row" alignItems="center" mb={2}>
      <Typography variant="h6" fontWeight={700} mb={0}>
        Список спринтов
      </Typography>
      <Box flex={1} />
      <Link to={infoLink} style={{ textDecoration: 'underline', marginRight: 12, cursor: 'pointer' }}>
        подробнее
      </Link>
      <Link
        to="settings"
        style={{
          backgroundColor: 'var(--mui-palette-primary-main, #1976d2)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 4,
          textDecoration: 'none',
          fontWeight: 500,
          display: 'inline-block'
        }}
      >
        Настройка спринтов
      </Link>
    </Stack>
  );
};

