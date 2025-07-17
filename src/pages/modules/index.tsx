import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface RoomBoxProps {
  roomName: string;
  children: ReactNode | ReactNode[];
}

const RoomBox = ({ roomName, children }: RoomBoxProps) => {
  return (
    <div className="mx-auto max-w-[900px] p-6 font-sans antialiased">
      {/* Хлебные крошки и ID */}
      <div className="mb-6 flex items-center justify-between text-sm">
        <span>
          <a href="/" className="underline">
            Список комнат
          </a>{" "}
          &gt; {roomName}
        </span>
        <span className="font-mono">ID: 56</span>
      </div>

      {/* Навигационная панель */}
      <div className="mb-8 grid grid-cols-4 gap-1">
        <NavLink
          to="setting"
          className={({ isActive }) =>
            `rounded-md border border-gray-300 py-2 text-sm font-semibold text-center ${
              isActive ? "bg-gray-100 opacity-50 cursor-not-allowed pointer-events-none" :"bg-white"
            }`
          }
        >
          Настройки
        </NavLink>
        <NavLink
          to="sprints"
          className={({ isActive }) =>
            `rounded-md border border-gray-300 py-2 text-sm font-semibold text-center ${
              isActive ? "bg-gray-100 opacity-50 cursor-not-allowed pointer-events-none" : "bg-white"
            }`
          }
        >
          Спринты
        </NavLink>
        <NavLink
          to="events"
          className={({ isActive }) =>
            `rounded-md border border-gray-300 py-2 text-sm font-semibold text-center ${
              isActive ? "bg-gray-100 opacity-50 cursor-not-allowed pointer-events-none" : "bg-white"
            }`
          }
        >
          События
        </NavLink>
        {/* Пустой блок для выравнивания */}
        <div></div>
      </div>

      {children}
    </div>
  );
};

export default RoomBox;
