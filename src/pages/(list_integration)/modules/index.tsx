import type { ReactNode } from "react";
import { Link, NavLink, useParams, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AppShell,
  type AppShellNavigationGroup,
  type AppShellNavigationItem,
  type AppShellRenderLink,
} from "@senler/ui/app-shell";
import {
  Alert,
  AlertDescription,
  Button,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Input,
  PageLoader,
} from "@senler/ui";
import {
  BadgePercent,
  Bell,
  Bot,
  Calendar,
  Check,
  ChartLine,
  ChevronsUpDown,
  CircleQuestionMark,
  CircleUser,
  Ellipsis,
  Gift,
  Megaphone,
  Plus,
  Users,
} from "lucide-react";
import tokenIcon from "@/assets/sprint-flow/token.svg";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRooms } from "@/hooks/rooms/useRooms";
import { rememberLastOpenedRoom } from "../rooms/roomSelection";

interface RoomBoxProps {
  children: ReactNode | ReactNode[];
}

type OverflowNavItem = {
  id: string;
  label: string;
  href: string;
  match: (path: string) => boolean;
};

const pathWithoutHash = (path: string) => path.split("#")[0];

const stubSoon = () => {
  toast.message("Скоро");
};

// ponytail: Figma placeholders; replace together when a sidebar-summary API is available.
const sidebarPlaceholderCounts = {
  eridTokens: 24,
  notifications: 1,
  sprints: 5,
  events: 5,
  participants: 23,
} as const;

const sidebarStubRowClassName =
  "flex h-8 w-full cursor-pointer items-center gap-[9px] rounded-lg px-2 text-left text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring";

const RoomBox = ({ children }: RoomBoxProps) => {
  const { slug } = useParams<{
    slug: string;
    eventId?: string;
  }>();
  const location = useLocation();
  const [roomSwitcherOpen, setRoomSwitcherOpen] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");

  const {
    room: roomData,
    isLoading,
    isError,
    error,
  } = useGetRoomById(slug || "");
  const roomsQuery = useRooms();

  const availableRooms = useMemo(
    () => roomsQuery.rooms.filter((room) => !room.isDeleted),
    [roomsQuery.rooms],
  );
  const filteredRooms = useMemo(() => {
    const query = roomSearch.trim().toLocaleLowerCase("ru-RU");
    if (!query) return availableRooms;
    return availableRooms.filter((room) =>
      room.name.toLocaleLowerCase("ru-RU").includes(query),
    );
  }, [availableRooms, roomSearch]);

  useEffect(() => {
    if (roomData?.id) rememberLastOpenedRoom(roomData.id);
  }, [roomData?.id]);

  const roomBase = slug ? `/rooms/${slug}` : "";
  const currentPath = `${location.pathname}${location.hash}`;

  const overflowItems = useMemo((): OverflowNavItem[] => {
    if (!roomBase) return [];

    return [
      {
        id: "promo-codes",
        label: "Промокоды",
        href: `${roomBase}/promo-codes`,
        match: (p) => pathWithoutHash(p).startsWith(`${roomBase}/promo-codes`),
      },
      {
        id: "vk-profile",
        label: "Профиль VK",
        href: `${roomBase}/vk-profile`,
        match: (p) => pathWithoutHash(p) === `${roomBase}/vk-profile`,
      },
      {
        id: "setting",
        label: "Настройки",
        href: `${roomBase}/setting`,
        match: (p) => pathWithoutHash(p).startsWith(`${roomBase}/setting`),
      },
      {
        id: "creativetasks",
        label: "Задачи",
        href: `${roomBase}/creativetasks`,
        match: (p) => {
          const pt = pathWithoutHash(p);
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
        match: (p) => pathWithoutHash(p) === `${roomBase}/invitations`,
      },
      {
        id: "ord",
        label: "ОРД",
        href: `${roomBase}/ord`,
        match: (p) => {
          const pt = pathWithoutHash(p);
          return (
            (pt === `${roomBase}/ord` || pt.startsWith(`${roomBase}/ord/`)) &&
            pt !== `${roomBase}/ord/profile` &&
            !pt.startsWith(`${roomBase}/ord/profile/`)
          );
        },
      },
      {
        id: "code",
        label: "Код для сайта",
        href: `${roomBase}/code`,
        match: (p) => pathWithoutHash(p) === `${roomBase}/code`,
      },
    ];
  }, [roomBase]);

  const overflowActive = overflowItems.some((item) => item.match(currentPath));

  const navigation = useMemo((): AppShellNavigationGroup[] => {
    if (!roomBase) {
      return [{ id: "main", items: [] }];
    }

    const items: AppShellNavigationItem[] = [
      {
        id: "sprints",
        label: "Спринт",
        icon: Calendar,
        badge: sidebarPlaceholderCounts.sprints,
        href: `${roomBase}/sprints`,
        match: (p) => {
          const pt = pathWithoutHash(p);
          const creativeTaskBase = `${roomBase}/creativetasks/`;
          return (
            pt === `${roomBase}/sprints` ||
            pt.startsWith(`${roomBase}/sprints/`) ||
            pt.startsWith(creativeTaskBase)
          );
        },
      },
      {
        id: "events",
        label: "События",
        icon: Megaphone,
        badge: sidebarPlaceholderCounts.events,
        href: `${roomBase}/events`,
        match: (p) => pathWithoutHash(p) === `${roomBase}/events` || pathWithoutHash(p).startsWith(`${roomBase}/events/`),
      },
      {
        id: "statistics",
        label: "Статистика",
        icon: ChartLine,
        href: `${roomBase}/statistics`,
      },
      {
        id: "rewards",
        label: "Награды",
        icon: Gift,
        href: `${roomBase}/rewards`,
      },
      {
        id: "applications",
        label: (
          <span className="flex w-full min-w-0 items-center">
            <span className="min-w-0 flex-1 truncate">Участники</span>
            <span className="ml-2 shrink-0 text-[#797979] tabular-nums">
              {sidebarPlaceholderCounts.participants}
            </span>
          </span>
        ),
        title: "Участники",
        icon: Users,
        href: `${roomBase}/applications`,
      },
      {
        id: "ord-profile",
        label: "Профиль ОРД",
        icon: CircleUser,
        href: `${roomBase}/ord/profile`,
        match: (p) => {
          const pt = pathWithoutHash(p);
          return (
            pt === `${roomBase}/ord/profile` ||
            pt.startsWith(`${roomBase}/ord/profile/`)
          );
        },
      },
    ];

    return [{ id: "room-nav", items }];
  }, [roomBase]);

  const renderLink: AppShellRenderLink = ({
    href,
    className,
    children,
    title,
    ...props
  }) => (
    <Link to={href} className={className} title={title} {...props}>
      {children}
    </Link>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isError && !roomData) {
    return (
      <div className="w-full px-4 py-6">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Ошибка при загрузке компании:{" "}
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
          <AlertDescription>Компания не найдена</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AppShell
      navigation={navigation}
      currentPath={currentPath}
      renderLink={renderLink}
      headerTitle={roomData.name}
      labels={{ navigation: "Разделы компании", openSidebar: "Открыть меню компании" }}
      className="bg-[#FFFFFF]"
      brand={
        <DropdownMenuRoot
          open={roomSwitcherOpen}
          onOpenChange={(open) => {
            setRoomSwitcherOpen(open);
            if (!open) setRoomSearch("");
          }}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 min-w-0 items-center justify-between rounded-lg pl-1.5 pr-2 text-black outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              aria-label={`Выбрать компанию. Текущая: ${roomData.name}`}
              title="Выбрать компанию"
            >
              <span className="flex min-w-0 items-center gap-[7px]">
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#e4e4e4] bg-[#141414]"
                  aria-hidden
                >
                  <BadgePercent
                    className="size-4 text-[#A07AFF]"
                    strokeWidth={1.25}
                  />
                </span>
                <span className="flex min-w-0 items-center gap-0.5">
                  <span className="min-w-0 truncate text-[13px] font-medium leading-4 tracking-[-0.0325px]">
                    {roomData.name}
                  </span>
                  <ChevronsUpDown
                    className="size-3 shrink-0 text-[#707070]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="w-[248px] overflow-hidden rounded-lg border border-[#e4e4e4] bg-white p-0 shadow-[0_16px_16px_rgba(0,0,0,0.16)]"
          >
            <div className="flex h-[34px] items-center gap-1.5 px-3 pb-1 pt-3">
              <p className="min-w-0 flex-1 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
                Ваши компании
              </p>
              <Button
                asChild
                type="button"
                variant="ghost"
                size="icon"
                className="size-[18px] shrink-0 rounded p-0 text-black"
              >
                <Link to="/rooms?create=1" aria-label="Создать компанию" title="Создать компанию">
                  <Plus className="size-[18px]" strokeWidth={1.5} aria-hidden />
                </Link>
              </Button>
            </div>
            <div className="px-3 py-1">
              <Input
                type="search"
                value={roomSearch}
                onChange={(event) => setRoomSearch(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                placeholder="Поиск..."
                aria-label="Поиск компаний"
                className="h-8 rounded-md border-0 bg-[#f0f0f0] px-2 text-[13px] font-medium leading-4 tracking-[-0.0325px] placeholder:text-[#636c72] shadow-none"
              />
            </div>
            <div className="max-h-[352px] overflow-y-auto">
              {roomsQuery.isLoading ? (
                <p className="px-3 py-4 text-center text-[12px] font-medium leading-4 text-[#797979]">
                  Загрузка…
                </p>
              ) : roomsQuery.isError ? (
                <div className="px-3 py-3 text-[12px] font-medium leading-4 text-[#797979]">
                  <p>Не удалось загрузить компании</p>
                  <Button
                    type="button"
                    variant="link"
                    className="mt-1 h-auto p-0 text-[12px]"
                    onClick={() => void roomsQuery.refetch()}
                  >
                    Повторить
                  </Button>
                </div>
              ) : filteredRooms.length === 0 ? (
                <p className="px-3 py-4 text-center text-[12px] font-medium leading-4 text-[#797979]">
                  Ничего не найдено
                </p>
              ) : (
                filteredRooms.map((room) => {
                  const active = room.id === roomData.id;
                  return (
                    <DropdownMenuItem key={room.id} asChild className="p-0 focus:bg-[#f7f7f7]">
                      <Link
                        to={`/rooms/${room.id}`}
                        className="flex h-11 min-w-0 items-center gap-2 border-b border-[#e4e4e4] px-3 py-1.5 text-black outline-none last:border-b-0"
                      >
                        <span
                          className={[
                            "flex size-8 shrink-0 items-center justify-center overflow-hidden border border-[#e4e4e4] text-center text-[12px] font-medium leading-4 text-white",
                            active ? "rounded-lg bg-[#141414]" : "rounded-[10px] bg-[#2563eb]",
                          ].join(" ")}
                          aria-hidden
                        >
                          {active ? (
                            <BadgePercent className="size-[21px] text-[#A07AFF]" strokeWidth={1.25} />
                          ) : (
                            room.name.trim().charAt(0).toLocaleUpperCase("ru-RU") || "К"
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium leading-4 tracking-[-0.0325px]">
                            {room.name}
                          </span>
                          <span className="block truncate text-[12px] font-medium leading-4 text-[#797979]">
                            Компания
                          </span>
                        </span>
                        {active ? (
                          <Check className="size-4 shrink-0 text-[#707070]" strokeWidth={1.5} aria-hidden />
                        ) : null}
                      </Link>
                    </DropdownMenuItem>
                  );
                })
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      }
      sidebarHeaderActions={
        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon_sm"
              className={[
                "opacity-100 transition-opacity md:opacity-0 md:hover:opacity-100 md:focus-visible:opacity-100",
                overflowActive ? "bg-muted text-foreground" : "",
              ].join(" ")}
              aria-label="Ещё разделы"
              title="Ещё разделы"
            >
              <Ellipsis className="size-4" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            {overflowItems.map((item) => (
              <DropdownMenuItem key={item.id} asChild>
                <NavLink to={item.href} className="cursor-pointer">
                  {item.label}
                </NavLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenuRoot>
      }
      sidebarTop={
        <ul className="grid gap-0">
          <li>
            <button
              type="button"
              className={sidebarStubRowClassName}
              onClick={stubSoon}
              title="ERID-токены — скоро"
            >
              <img
                src={tokenIcon}
                alt=""
                className="size-5 shrink-0"
                aria-hidden
              />
              <span className="min-w-0 shrink truncate">ERID-токены</span>
              <span className="ml-auto shrink-0 text-[13px] font-medium leading-4 text-[#797979] tabular-nums">
                {sidebarPlaceholderCounts.eridTokens}
              </span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className={sidebarStubRowClassName}
              onClick={stubSoon}
              title="Уведомления — скоро"
            >
              <Bell
                className="size-5 shrink-0 text-[#707070]"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="min-w-0 shrink truncate">Уведомления</span>
              <span className="ml-auto flex h-4 min-w-4 shrink-0 items-center justify-center rounded-[6px] bg-[#D52094] px-1.5 text-[12px] font-medium leading-4 tracking-normal text-white tabular-nums">
                {sidebarPlaceholderCounts.notifications}
              </span>
            </button>
          </li>
        </ul>
      }
      sidebarFooter={
        <button
          type="button"
          className="flex h-8 w-full items-center gap-[9px] rounded-lg border border-[#e4e4e4] bg-[#FFFFFF] px-2 text-left text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black transition-colors hover:bg-sidebar-accent"
          onClick={stubSoon}
          title="Создаем бота — скоро"
        >
          <Bot
            className="size-5 shrink-0 text-[#2563eb]"
            strokeWidth={1.5}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate">Создаем бота...</span>
          <CircleQuestionMark
            className="size-4 shrink-0 text-[#707070]"
            strokeWidth={1.5}
            aria-hidden
          />
        </button>
      }
      headerClassName="md:hidden"
      sidebarClassName={[
        "h-auto min-h-dvh w-[260px] self-stretch border-[#e4e4e4] bg-[#FFFFFF] text-black",
        // хедер компании = обычная строка списка, без линии и без лишней высоты
        "[&>div>div:first-child]:relative [&>div>div:first-child]:h-auto [&>div>div:first-child]:border-b-0 [&>div>div:first-child]:pl-1 [&>div>div:first-child]:pr-2 [&>div>div:first-child]:pt-[6px] [&>div>div:first-child]:pb-0",
        // overflow сохраняет доступность, но не занимает место и показывается только по hover/focus
        "[&>div>div:first-child>div:last-child]:absolute [&>div>div:first-child>div:last-child]:right-2 [&>div>div:first-child>div:last-child]:top-[10px]",
        // токены/уведомления примыкают к названию и к навигации
        "[&>div>div:nth-child(2)]:pl-1 [&>div>div:nth-child(2)]:pr-2 [&>div>div:nth-child(2)]:py-0",
        "[&_nav]:gap-0 [&_nav]:pl-1 [&_nav]:pr-2 [&_nav]:pb-2 [&_nav]:pt-0 [&_nav_ul]:gap-0",
        "[&_nav_a]:gap-[9px] [&_nav_a]:rounded-lg [&_nav_a]:text-[13px] [&_nav_a]:font-medium [&_nav_a]:leading-4 [&_nav_a]:tracking-[-0.0325px] [&_nav_a]:text-black",
        "[&_nav_button]:gap-[9px] [&_nav_button]:rounded-lg [&_nav_button]:text-[13px] [&_nav_button]:font-medium [&_nav_button]:leading-4 [&_nav_button]:tracking-[-0.0325px] [&_nav_button]:text-black",
        "[&_nav_svg]:size-5 [&_nav_svg]:text-[#707070] [&_nav_svg]:[stroke-width:1.5]",
        "[&_nav_a>div:last-child]:ml-auto [&_nav_a>div:last-child]:h-4 [&_nav_a>div:last-child]:min-w-4 [&_nav_a>div:last-child]:rounded-[6px] [&_nav_a>div:last-child]:border-0 [&_nav_a>div:last-child]:bg-[#D52094] [&_nav_a:hover>div:last-child]:bg-[#D52094] [&_nav_a>div:last-child]:px-1.5 [&_nav_a>div:last-child]:py-0 [&_nav_a>div:last-child]:text-[12px] [&_nav_a>div:last-child]:font-medium [&_nav_a>div:last-child]:leading-4 [&_nav_a>div:last-child]:tracking-normal [&_nav_a>div:last-child]:text-white",
        "[&_a[aria-current=page]]:bg-[#2563eb] [&_a[aria-current=page]]:font-medium [&_a[aria-current=page]]:text-white [&_a[aria-current=page]_svg]:text-white",
        "[&_button[aria-current=page]]:bg-[#2563eb] [&_button[aria-current=page]]:text-white",
        // footer по макету: x=4, right=4, bottom=4, h=32
        "[&>div>div:last-child]:px-1 [&>div>div:last-child]:pt-0 [&>div>div:last-child]:pb-1",
      ].join(" ")}
      mainClassName="min-h-0 flex-1 overflow-y-auto bg-[#FFFFFF] p-4 md:p-6"
    >
      {children}
    </AppShell>
  );
};

export default RoomBox;
