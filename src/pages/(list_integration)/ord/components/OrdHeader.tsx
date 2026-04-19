import { Box, Tab, Tabs } from "@mui/material";
import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ORD_COPY } from "../ord.constants";

export const OrdHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const slug = params.slug || location.pathname.split("/rooms/")[1]?.split("/")[0];

  const currentTab = useMemo(() => (location.pathname.includes("/ord/profile") ? 1 : 0), [location.pathname]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (!slug) return;
    if (newValue === 0) {
      navigate(`/rooms/${slug}/ord`);
    } else {
      navigate(`/rooms/${slug}/ord/profile`);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tab label={ORD_COPY.contractsTab} />
        <Tab label={ORD_COPY.profileTab} />
      </Tabs>
    </Box>
  );
};
