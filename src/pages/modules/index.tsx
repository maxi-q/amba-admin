import type { ReactNode } from "react";

interface RoomBox {
    roomName: string;
    children: ReactNode | ReactNode[];
}

const RoomBox = ({roomName, children}: RoomBox) => {
  return (
    <div className="container">
      {/* Хлебные крошки и ID */}
      <div className="breadcrumbs">
        <span>
          <a href="#">Список комнат</a> &gt; {roomName}
        </span>
        <span className="room-id">ID: 56</span>
      </div>

      {/* Табы */}
      <div className="tabs">
        <button className="tab active">Настройки</button>
        <button className="tab" disabled>
          Спринты
        </button>
        <button className="tab" disabled>
          Вебхук
        </button>
        <button className="tab" disabled>
          Форма для сайта
        </button>
      </div>

      {children}

    </div>
  )
}

export default RoomBox