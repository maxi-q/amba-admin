import { Outlet, matchPath, useLocation } from "react-router-dom";
import { SprintsHeader } from "./components/SprintsHeader";

export const SprintsLayout = () => {
  const { pathname } = useLocation();
  /** Старые вкладки только на settings / info / leaderboard комнаты */
  const showLegacyHeader = Boolean(
    matchPath({ path: "/rooms/:slug/sprints/settings", end: true }, pathname) ||
      matchPath({ path: "/rooms/:slug/sprints/info", end: true }, pathname) ||
      matchPath({ path: "/rooms/:slug/sprints/leaderboard", end: true }, pathname)
  );

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      {showLegacyHeader ? (
        <div className="px-2 pt-6">
          <SprintsHeader />
        </div>
      ) : null}
      <Outlet />
    </div>
  );
};
