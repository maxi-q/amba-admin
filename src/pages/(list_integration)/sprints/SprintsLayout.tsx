import { Outlet } from "react-router-dom";
import { SprintsHeader } from "./components/SprintsHeader";

export const SprintsLayout = () => {
  return (
    <div className="w-full">
      <div className="px-2 pt-6">
        <SprintsHeader />
      </div>
      <Outlet />
    </div>
  );
};
