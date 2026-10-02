import { Outlet, useLocation } from "react-router-dom";
import { EventsHeader } from "./components/EventsHeader";

export const EventsLayout = () => {
  const { pathname } = useLocation();
  const legacy = /\/(info|subscribers|invitations)$/.test(pathname);
  return (
    <div className="w-full">
      {legacy && <div className="px-2 pt-6">
        <EventsHeader />
      </div>}
      <Outlet />
    </div>
  );
};
