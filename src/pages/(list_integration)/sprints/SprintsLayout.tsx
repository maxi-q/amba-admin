import { Outlet, matchPath, useLocation } from "react-router-dom";
import { SprintsHeader } from "./components/SprintsHeader";

export const SprintsLayout = () => {
  const { pathname } = useLocation();
  const isListPage = Boolean(
    matchPath({ path: "/rooms/:slug/sprints", end: true }, pathname)
  );
  const isCreationPage = Boolean(
    matchPath({ path: "/rooms/:slug/sprints/new", end: true }, pathname)
  );

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      {!isListPage && !isCreationPage ? (
        <div className="px-2 pt-6">
          <SprintsHeader />
        </div>
      ) : null}
      <Outlet />
    </div>
  );
};
