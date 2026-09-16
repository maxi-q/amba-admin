import { Input } from "@senler/ui";
import {
  NavLink,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";

const tabClass =
  "rounded-[4px] px-1.5 py-1 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black outline-none transition-colors hover:bg-white/70 focus:ring-0";

export function CreativeTaskDetailHeader() {
  const { slug, taskId } = useParams<{
    slug: string;
    taskId: string;
  }>();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!slug || !taskId) {
    return null;
  }

  const base = `/rooms/${slug}/creativetasks/${taskId}`;
  const isExecutionsPage = pathname === `${base}/answers`;
  const search = searchParams.get("search") ?? "";

  return (
    <div className="mt-3 flex h-12 items-center gap-2 border-y border-[#e4e4e4] px-4 py-2.5">
      <nav
        className="inline-flex h-7 items-center gap-0.5 rounded-[6px] bg-[#f0f0f0] p-0.5"
        aria-label="Разделы задания"
      >
        <NavLink
          to={`${base}/answers`}
          className={({ isActive }) =>
            `${tabClass} ${isActive ? "bg-white shadow-[inset_0_0_0_1px_#e4e4e4]" : ""}`
          }
        >
          Выполнение
        </NavLink>
        <NavLink
          to={base}
          end
          className={({ isActive }) =>
            `${tabClass} ${isActive ? "bg-white shadow-[inset_0_0_0_1px_#e4e4e4]" : ""}`
          }
        >
          Информация
        </NavLink>
      </nav>

      {isExecutionsPage ? (
        <Input
          type="search"
          value={search}
          onChange={(event) => {
            const next = new URLSearchParams(searchParams);
            if (event.target.value) next.set("search", event.target.value);
            else next.delete("search");
            setSearchParams(next, { replace: true });
          }}
          placeholder="Поиск..."
          aria-label="Поиск выполнений"
          className="h-7 min-w-0 flex-1 rounded-[6px] border-0 bg-[#f0f0f0] px-2 py-1.5 text-[13px] font-medium leading-4 shadow-none focus-visible:border-transparent"
        />
      ) : null}
    </div>
  );
}
