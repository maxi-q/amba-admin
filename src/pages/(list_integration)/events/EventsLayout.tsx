import { Outlet } from "react-router-dom";
import { EventsHeader } from "./components/EventsHeader";

export const EventsLayout = () => {
  return (
    <div className="w-full">
      <div className="px-2 pt-6">
        <EventsHeader />
      </div>
      <Outlet />
    </div>
  );
};
