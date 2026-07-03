import { NavLink, useParams } from "react-router-dom";

const tabInactive =
  "relative pb-3 pt-0 text-[15px] font-normal text-muted-foreground transition-colors hover:text-foreground";
const tabActive =
  "relative pb-3 pt-0 text-[15px] font-semibold text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary";

/**
 * Заголовок страницы «Задачи»
 */
export function CreativeTasksHeader() {
  const { slug } = useParams<{ slug: string }>();
  const base = slug ? `/rooms/${slug}/creativetasks` : "";

  return (
    <div className="mb-4">
      <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground">
        Задачи
      </h2>
      {base ? (
        <div className="border-b border-border">
          <nav className="flex flex-wrap gap-6" aria-label="Разделы задач">
            <NavLink
              to={base}
              end
              className={({ isActive }) => (isActive ? tabActive : tabInactive)}
            >
              Обычные
            </NavLink>
            <NavLink
              to={`${base}/private`}
              className={({ isActive }) => (isActive ? tabActive : tabInactive)}
            >
              Индивидуальные
            </NavLink>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
