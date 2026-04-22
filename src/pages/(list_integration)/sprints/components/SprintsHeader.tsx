import { NavLink, useParams } from "react-router-dom";

const tabInactive =
  "relative pb-3 pt-0 text-[15px] font-normal text-muted-foreground transition-colors hover:text-foreground";
const tabActive =
  "relative pb-3 pt-0 text-[15px] font-semibold text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary";

/** Сегменты маршрута, для которых не показываем вкладку «Спринт» */
const NO_SPRINT_TAB = new Set(["settings", "info"]);

export const SprintsHeader = () => {
  const { slug, sprintId: sprintIdParam } = useParams<{
    slug: string;
    sprintId?: string;
  }>();

  const sprintSectionId =
    sprintIdParam && !NO_SPRINT_TAB.has(sprintIdParam)
      ? sprintIdParam
      : undefined;

  const listPath = slug ? `/rooms/${slug}/sprints` : "";
  const settingsPath = slug ? `/rooms/${slug}/sprints/settings` : "";
  const sprintPath =
    slug && sprintSectionId
      ? `/rooms/${slug}/sprints/${sprintSectionId}`
      : "";

  if (!slug) {
    return null;
  }

  return (
    <div className="mb-2 border-b border-border">
      <nav className="flex flex-wrap gap-6" aria-label="Раздел спринтов">
        <NavLink
          to={listPath}
          end
          className={({ isActive }) => (isActive ? tabActive : tabInactive)}
        >
          Список
        </NavLink>
        {sprintSectionId ? (
          <NavLink
            to={sprintPath}
            className={({ isActive }) => (isActive ? tabActive : tabInactive)}
          >
            Спринт
          </NavLink>
        ) : null}
        <NavLink
          to={settingsPath}
          className={({ isActive }) => (isActive ? tabActive : tabInactive)}
        >
          Настройки
        </NavLink>
      </nav>
    </div>
  );
};
