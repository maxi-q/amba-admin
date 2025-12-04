import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { SprintsHeader } from "./components/SprintsHeader";

export const SprintsLayout = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ px: 2, pt: 3 }}>
        <SprintsHeader />
      </Box>
      <Outlet />
    </Box>
  );
};

