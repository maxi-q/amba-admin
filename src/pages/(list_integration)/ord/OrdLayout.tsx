import { Outlet, useLocation } from "react-router-dom";
import { OrdHeader } from "./components/OrdHeader";

export default function OrdLayout() {
  const isProfile = useLocation().pathname.replace(/\/$/, "").endsWith("/ord/profile");
  return (
    <div className="w-full">
      {!isProfile && <div className="px-2 pt-3">
        <OrdHeader />
      </div>}
      <Outlet />
    </div>
  );
}
