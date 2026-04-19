import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { OrdHeader } from "./components/OrdHeader";

export default function OrdLayout() {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ px: 2, pt: 3 }}>
        <OrdHeader />
      </Box>
      <Outlet />
    </Box>
  );
}
