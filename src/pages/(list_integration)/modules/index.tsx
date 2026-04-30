import type { ReactNode } from "react";
import { NavLink, useParams, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  AppShell,
  type AppShellBreadcrumb,
  type AppShellNavigationGroup,
  type AppShellNavigationItem,
  type AppShellRenderLink,
} from "@senler/ui/app-shell";
import { Alert, AlertDescription, Button, PageLoader } from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";



interface RoomBoxProps {
  children: ReactNode | ReactNode[];
}

const RoomBox = ({ children }: RoomBoxProps) => {
  const { slug, eventId } = useParams<{
    slug: string;
    eventId?: string;
  }>();
  const location = useLocation();

  const {
    room: roomData,
    isLoading,
    isError,
    error,
  } = useGetRoomById(slug || "");

  const roomBase = slug ? `/rooms/${slug}` : "";
  const currentPath = `${location.pathname}${location.hash}`;

  const navigation = useMemo((): AppShellNavigationGroup[] => {
    if (!roomBase) {
      return [{ id: "main", items: [] }];
    }

    const items: AppShellNavigationItem[] = [
      {
        id: "setting",
        label: "Настройки",
        href: `${roomBase}/setting`,
        match: (p) => p.split("#")[0] === `${roomBase}/setting`,
        defaultOpen: true,
        items: [
          {
            id: "bots",
            label: "Боты",
            href: `${roomBase}/setting#bots`,
            match: (p) => p.includes("#bots"),
          },
          {
            id: "webhook",
            label: "Webhook",
            href: `${roomBase}/setting#webhook`,
            match: (p) => p.includes("#webhook"),
          },
        ],
      },
      {
        id: "sprints",
        label: "Спринты",
        href: `${roomBase}/sprints`,
      },
      {
        id: "events",
        label: "События",
        href: `${roomBase}/events`,
        match: (p) => {
          const pt = p.split("#")[0];
          return (
            pt === `${roomBase}/events` ||
            pt.startsWith(`${roomBase}/events/`)
          );
        },
        defaultOpen: true,
        items: [
          {
            id: "events-list",
            label: "Список",
            href: `${roomBase}/events`,
            match: (p) => p.split("#")[0] === `${roomBase}/events`,
          },
          ...(eventId
            ? [
                {
                  id: "events-event",
                  label: "Событие",
                  href: `${roomBase}/events/${eventId}`,
                  match: (p: string) =>
                    p.split("#")[0].startsWith(
                      `${roomBase}/events/${eventId}`
                    ),
                },
              ]
            : []),
          {
            id: "events-info",
            label: "Справка",
            href: `${roomBase}/events/info`,
            match: (p) =>
              p.split("#")[0] === `${roomBase}/events/info`,
          },
        ],
      },
      {
        id: "creativetasks",
        label: "Задачи",
        href: `${roomBase}/creativetasks`,
        match: (p) => {
          const pt = p.split("#")[0];
          return (
            pt === `${roomBase}/creativetasks` ||
            pt.startsWith(`${roomBase}/creativetasks/`)
          );
        },
      },
      {
        id: "invitations",
        label: "Приглашения",
        href: `${roomBase}/invitations`,
      },
      {
        id: "ord",
        label: "ОРД",
        href: `${roomBase}/ord`,
      },
      {
        id: "applications",
        label: "Заявки",
        href: `${roomBase}/applications`,
      },
      {
        id: "statistics",
        label: "Статистика",
        href: `${roomBase}/statistics`,
      },
      {
        id: "code",
        label: "Код для сайта",
        href: `${roomBase}/code`,
      },
    ];

    return [{ id: "room-nav", items }];
  }, [roomBase, eventId]);

  const headerBreadcrumbs: AppShellBreadcrumb[] = useMemo(
    () => [
      { id: "rooms", label: "Список комнат", href: "/" },
      { id: "room-name", label: roomData?.name ?? "…" },
    ],
    [roomData?.name]
  );

  const renderLink: AppShellRenderLink = ({
    href,
    className,
    children,
    title,
    ...props
  }) => (
    <NavLink to={href} className={className} title={title} {...props}>
      {children}
    </NavLink>
  );

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(
        `ID комнаты:${roomData?.id ?? "Ошибка получения ID комнаты"}`
      );
      toast.success("Скопировано");
    } catch {
      console.error("Ошибка при копировании");
      toast.error(
        `Браузер запретил копирование. ID комнаты: ${roomData?.id ?? ""}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full px-4 py-6">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Ошибка при загрузке комнаты:{" "}
            {error?.message ?? "Неизвестная ошибка"}
          </AlertDescription>
        </Alert>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </Button>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="w-full px-4 py-6">
        <Alert>
          <AlertDescription>Комната не найдена</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AppShell
      navigation={navigation}
      currentPath={currentPath}
      renderLink={renderLink}
      brand={
        <span className="truncate text-sm font-semibold text-sidebar-foreground">
          {roomData.name}
        </span>
      }
      headerBreadcrumbs={headerBreadcrumbs}
      headerActions={
        <Button
          type="button"
          variant="link"
          className="h-auto shrink-0 px-0 text-[13px] font-normal"
          onClick={handleCopyRoomId}
        >
          Скопировать ID комнаты
        </Button>
      }
      sidebarClassName="h-auto min-h-dvh self-stretch"
      mainClassName="min-h-min flex-none overflow-visible p-4 md:p-6"
    >
      {children}
    </AppShell>
  );
};

export default RoomBox;
