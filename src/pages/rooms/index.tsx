import { useState } from "react";
import { Pencil } from "lucide-react";
import Button from "@components/ui/button";

// Тип комнаты
interface Room {
  id: number;
  name: string;
}

// Страница со списком комнат
export default function RoomsPage() {
  // Начальные данные (для примера)
  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, name: "Конференция суровый маркетинг 2025" },
  ]);

  // Обработчик создания новой комнаты
  const handleCreateRoom = () => {
    const name = prompt("Введите название новой комнаты:");
    if (name) {
      setRooms((prev) => [
        ...prev,
        { id: Date.now(), name }, // в реальном приложении id придёт с бэка
      ]);
    }
  };

  return (
    <main className="flex min-h-screen items-start justify-center bg-muted p-6">
      {/* Карточка‑контейнер */}
      <section className="w-full max-w-4xl rounded-3xl border bg-background p-8 shadow-sm">
        {/* Заголовок */}
        <h1 className="text-center text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
          Список комнат
        </h1>

        {/* Список комнат */}
        <ul className="mt-8 space-y-4">
          {rooms.map((room) => (
            <li key={room.id}>
              <a
                href={`/rooms/${room.id}`}
                className="flex items-center justify-between rounded-xl border p-4 shadow-sm transition hover:bg-muted/50"
              >
                <span className="truncate text-sm font-medium sm:text-base md:text-lg">
                  {room.name}
                </span>

                {/* Ссылка‑кнопка перехода к комнате */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
              </a>
            </li>
          ))}
        </ul>

        {/* Кнопка создания */}
        <div className="mt-16 flex justify-end">
          <Button
            onClick={handleCreateRoom}
            className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50 to-emerald-100/70 px-6 py-3 text-sm font-semibold shadow-inner hover:from-emerald-100 hover:to-emerald-50 sm:text-base"
          >
            Создать комнату
          </Button>
        </div>
      </section>
    </main>
  );
}
