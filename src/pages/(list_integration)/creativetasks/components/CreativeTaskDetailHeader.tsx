import { NavLink, useParams } from "react-router-dom";

const tabClass =
  "rounded-[4px] px-1.5 py-1 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black outline-none transition-colors hover:bg-white/70 focus:ring-0";

export function CreativeTaskDetailHeader() {
  const { slug, taskId } = useParams<{
    slug: string;
    taskId: string;
  }>();

  if (!slug || !taskId) {
    return null;
  }

  const base = `/rooms/${slug}/creativetasks/${taskId}`;

  return (
    <div className="px-4 pt-3">
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
          Отчеты
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
    </div>
  );
}
