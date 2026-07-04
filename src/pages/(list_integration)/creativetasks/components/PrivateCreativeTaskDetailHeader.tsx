import { NavLink, useParams } from "react-router-dom";

const tabInactive =
  "relative pb-3 pt-0 text-[15px] font-normal text-muted-foreground transition-colors hover:text-foreground";
const tabActive =
  "relative pb-3 pt-0 text-[15px] font-semibold text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary";

export function PrivateCreativeTaskDetailHeader() {
  const { slug, privateTaskId } = useParams<{
    slug: string;
    privateTaskId: string;
  }>();

  if (!slug || !privateTaskId) {
    return null;
  }

  const base = `/rooms/${slug}/creativetasks/private/${privateTaskId}`;

  return (
    <div className="mb-4 border-b border-border">
      <nav className="flex flex-wrap gap-6" aria-label="Разделы индивидуальной задачи">
        <NavLink
          to={base}
          end
          className={({ isActive }) => (isActive ? tabActive : tabInactive)}
        >
          Описание
        </NavLink>
        <NavLink
          to={`${base}/answers`}
          className={({ isActive }) => (isActive ? tabActive : tabInactive)}
        >
          Ответы на задачу
        </NavLink>
        <NavLink
          to={`${base}/invitations`}
          className={({ isActive }) => (isActive ? tabActive : tabInactive)}
        >
          Приглашения в задачу
        </NavLink>
        <NavLink
          to={`${base}/ord-creative`}
          className={({ isActive }) => (isActive ? tabActive : tabInactive)}
        >
          Креатив ОРД
        </NavLink>
      </nav>
    </div>
  );
}
