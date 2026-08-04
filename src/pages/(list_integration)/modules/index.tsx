import type { ReactNode } from "react";
import { NavLink, useParams, useLocation } from "react-router-dom";
import { useMemo } from "react";
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
  PageLoader,
} from "@senler/ui";
import {
  Bell,
  Bot,
  Calendar,
  ChartPie,
  ChevronsUpDown,
  CircleQuestionMark,
  CircleDashed,
  CircleUser,
  Ellipsis,
  Gift,
  Users,
} from "lucide-react";
import { IndividualTasksIcon } from "@/assets/icons/IndividualTasksIcon";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";

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

const sidebarStubRowClassName =
  "flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-left text-[13px] font-medium leading-4 tracking-[-0.25px] text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring";

const RoomBox = ({ children }: RoomBoxProps) => {
  const { slug } = useParams<{
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

  const overflowItems = useMemo((): OverflowNavItem[] => {
    if (!roomBase) return [];

    return [
      {
        id: "setting",
        label: "Настройки",
        href: `${roomBase}/setting`,
        match: (p) => pathWithoutHash(p).startsWith(`${roomBase}/setting`),
      },
      {
        id: "events",
        label: "События",
        href: `${roomBase}/events`,
        match: (p) => {
          const pt = pathWithoutHash(p);
          return (
            pt === `${roomBase}/events` || pt.startsWith(`${roomBase}/events/`)
          );
        },
      },
      {
        id: "creativetasks",
        label: "Задачи",
        href: `${roomBase}/creativetasks`,
        match: (p) => {
          const pt = pathWithoutHash(p);
          return (
            pt === `${roomBase}/creativetasks` ||
            (pt.startsWith(`${roomBase}/creativetasks/`) &&
              !pt.startsWith(`${roomBase}/creativetasks/private`))
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
        href: `${roomBase}/sprints`,
        match: (p) => {
          const pt = pathWithoutHash(p);
          return (
            pt === `${roomBase}/sprints` || pt.startsWith(`${roomBase}/sprints/`)
          );
        },
      },
      {
        id: "private-tasks",
        label: "Индивидуальные задания",
        icon: IndividualTasksIcon,
        href: `${roomBase}/creativetasks/private`,
        match: (p) =>
          pathWithoutHash(p).startsWith(`${roomBase}/creativetasks/private`),
      },
      {
        id: "rewards",
        label: "Награды",
        icon: Gift,
        href: `${roomBase}/rewards`,
      },
      {
        id: "statistics",
        label: "Аналитика",
        icon: ChartPie,
        href: `${roomBase}/statistics`,
      },
      {
        id: "applications",
        label: "Участники",
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
    <NavLink to={href} className={className} title={title} {...props}>
      {children}
    </NavLink>
  );

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
      className="bg-[#FFFFFF]"
      brand={
        <NavLink
          to="/"
          className="flex h-8 min-w-0 items-center gap-2 rounded-lg px-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          title="К списку компаний"
        >
          <span
            className="size-6 shrink-0 rounded-lg bg-[#141414]"
            aria-hidden
          />
          <span className="min-w-0 truncate text-[13px] font-medium leading-4 tracking-[-0.25px]">
            {roomData.name}
          </span>
          <ChevronsUpDown
            className="size-3 shrink-0 text-[#707070]"
            aria-hidden
          />
          <span className="ml-auto flex shrink-0 items-center gap-1 text-[13px] text-[#797979]">
            <Users className="size-4" aria-hidden />
            0
          </span>
        </NavLink>
      }
      sidebarHeaderActions={
        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon_sm"
              className={
                overflowActive ? "bg-muted text-foreground" : undefined
              }
              aria-label="Ещё разделы"
              title="Ещё разделы"
            >
              <Ellipsis className="size-4" />
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
        <ul className="grid gap-1">
          <li>
            <button
              type="button"
              className={sidebarStubRowClassName}
              onClick={stubSoon}
              title="Токены — скоро"
            >
              <CircleDashed
                className="size-5 shrink-0 text-[#22C55E]"
                aria-hidden
              />
              <span className="min-w-0 shrink truncate">Токены</span>
              <span className="ml-auto shrink-0 text-[13px] font-medium leading-4 text-[#797979] tabular-nums">
                5 000
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
              <Bell className="size-5 shrink-0 text-[#707070]" aria-hidden />
              <span className="min-w-0 shrink truncate">Уведомления</span>
              <span className="ml-auto flex h-4 min-w-4 shrink-0 items-center justify-center rounded-[6px] bg-[#D52094] px-1.5 text-[12px] font-medium leading-4 text-white tabular-nums">
                1
              </span>
            </button>
          </li>
        </ul>
      }
      sidebarFooter={
        <button
          type="button"
          className="flex h-8 w-full items-center gap-2 rounded-lg border border-[#e4e4e4] bg-[#FFFFFF] px-2 text-left text-[13px] font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          onClick={stubSoon}
          title="Создаем бота — скоро"
        >
          <Bot className="size-4 shrink-0 text-[#2563eb]" aria-hidden />
          <span className="min-w-0 flex-1 truncate">Создаем бота...</span>
          <CircleQuestionMark
            className="size-4 shrink-0 text-[#707070]"
            aria-hidden
          />
        </button>
      }
      headerClassName="hidden"
      sidebarClassName={[
        "h-auto min-h-dvh w-[260px] self-stretch border-[#e4e4e4] bg-[#FFFFFF] text-sidebar-foreground",
        // хедер компании = обычная строка списка, без линии и без лишней высоты
        "[&>div>div:first-child]:h-auto [&>div>div:first-child]:border-b-0 [&>div>div:first-child]:px-2 [&>div>div:first-child]:pt-2 [&>div>div:first-child]:pb-0",
        // токены/уведомления примыкают к названию и к навигации
        "[&>div>div:nth-child(2)]:px-2 [&>div>div:nth-child(2)]:py-0",
        "[&_nav]:gap-1 [&_nav]:px-2 [&_nav]:pb-2 [&_nav]:pt-0",
        "[&_a[aria-current=page]]:bg-[#2563eb] [&_a[aria-current=page]]:font-medium [&_a[aria-current=page]]:text-white [&_a[aria-current=page]_svg]:text-white",
        "[&_button[aria-current=page]]:bg-[#2563eb] [&_button[aria-current=page]]:text-white",
      ].join(" ")}
      mainClassName="min-h-0 flex-1 overflow-y-auto bg-[#FFFFFF] p-4 md:p-6"
    >
      {children}
    </AppShell>
  );
};

export default RoomBox;
