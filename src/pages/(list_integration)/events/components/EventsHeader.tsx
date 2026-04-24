import { NavLink, useParams } from "react-router-dom";

const tabInactive =
  "relative pb-3 pt-0 text-[15px] font-normal text-muted-foreground transition-colors hover:text-foreground";
const tabActive =
  "relative pb-3 pt-0 text-[15px] font-semibold text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary";

export const EventsHeader = () => {
  const { slug, eventId } = useParams<{
    slug: string;
    eventId?: string;
  }>();

  const listPath = slug ? `/rooms/${slug}/events` : "";
  const infoPath = slug ? `/rooms/${slug}/events/info` : "";
  const eventPath =
    slug && eventId ? `/rooms/${slug}/events/${eventId}` : "";

  if (!slug) {
    return null;
  }

  return (
    <div className="mb-2 border-b border-border">
      <nav className="flex flex-wrap gap-6" aria-label="Раздел событий">
        <NavLink
          to={listPath}
          end
          className={({ isActive }) => (isActive ? tabActive : tabInactive)}
        >
          Список
        </NavLink>
        {eventId ? (
          <NavLink
            to={eventPath}
            className={({ isActive }) => (isActive ? tabActive : tabInactive)}
          >
            Событие
          </NavLink>
        ) : null}
        <NavLink
          to={infoPath}
          className={({ isActive }) => (isActive ? tabActive : tabInactive)}
        >
          Справка
        </NavLink>
      </nav>
    </div>
  );
};
