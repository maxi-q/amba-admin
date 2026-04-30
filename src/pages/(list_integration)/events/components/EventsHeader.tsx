import { NavLink, useParams } from "react-router-dom";

const tabInactive =
  "relative pb-3 pt-0 text-[15px] font-normal text-muted-foreground transition-colors hover:text-foreground";
const tabActive =
  "relative pb-3 pt-0 text-[15px] font-semibold text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary";

/**
 * Горизонтальная навигация на странице выбранного события:
 * Описание, группы подписчиков, приглашения.
 * (Список / Событие / Справка — в сайдбаре RoomBox.)
 */
export const EventsHeader = () => {
  const { slug, eventId } = useParams<{
    slug: string;
    eventId?: string;
  }>();

  if (!slug || !eventId) {
    return null;
  }

  const base = `/rooms/${slug}/events/${eventId}`;

  if (eventId === "new") {
    return (
      <div className="mb-2 border-b border-border">
        <nav
          className="flex flex-wrap gap-6"
          aria-label="Разделы события"
        >
          <NavLink
            to={base}
            end
            className={({ isActive }) => (isActive ? tabActive : tabInactive)}
          >
            Описание
          </NavLink>
        </nav>
      </div>
    );
  }

  return (
    <div className="mb-2 border-b border-border">
      <nav className="flex flex-wrap gap-6" aria-label="Разделы события">
        <NavLink
          to={base}
          end
          className={({ isActive }) => (isActive ? tabActive : tabInactive)}
        >
          Описание
        </NavLink>
        <NavLink
          to={`${base}/subscribers`}
          className={({ isActive }) => (isActive ? tabActive : tabInactive)}
        >
          Группы подписчиков
        </NavLink>
        <NavLink
          to={`${base}/invitations`}
          className={({ isActive }) => (isActive ? tabActive : tabInactive)}
        >
          Приглашения в событие
        </NavLink>
      </nav>
    </div>
  );
};
