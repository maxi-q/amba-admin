import { Tabs, Tab, Box } from "@mui/material";
import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export const SprintsHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const slug = params.slug || location.pathname.split('/rooms/')[1]?.split('/')[0];

  const isSettingsPage = useMemo(() => location.pathname.includes('/sprints/settings'), [location.pathname]);
  const isSprintPage = useMemo(() => {
    const pathMatch = location.pathname.match(/\/sprints\/([^/]+)/);
    return pathMatch && pathMatch[1] !== 'settings' && pathMatch[1] !== 'info';
  }, [location.pathname]);

  const currentTab = useMemo(() => {
    if (isSettingsPage) return isSprintPage ? 2 : 1;
    if (isSprintPage) return 1;
    return 0;
  }, [isSettingsPage, isSprintPage]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (!slug) return;

    if (newValue === 0) {
      navigate(`/rooms/${slug}/sprints`);
    } else if (newValue === 1 || newValue === 2) {
      navigate(`/rooms/${slug}/sprints/settings`);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tab label="Список" />
        {isSprintPage && <Tab label="Спринт" />}
        <Tab label="Настройки" />
      </Tabs>
    </Box>
  );
};

