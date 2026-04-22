import { Outlet } from "react-router-dom";
import { OrdHeader } from "./components/OrdHeader";

export default function OrdLayout() {
  return (
    <div className="w-full">
      <div className="px-2 pt-3">
        <OrdHeader />
      </div>
      <Outlet />
    </div>
  );
}
