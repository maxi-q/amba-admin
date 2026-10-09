import { Button } from "@senler/ui";
import plus from "@/assets/task-flow/plus.svg";

interface CreateEventButtonProps {
  /** Обработчик клика для создания нового события */
  onClick: () => void;
}

/**
 * Кнопка для создания нового события в шапке списка
 */
export const CreateEventButton = ({ onClick }: CreateEventButtonProps) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="h-7 gap-1 bg-[#2563eb] px-2 text-[13px] font-medium leading-4 shadow-none hover:bg-[#2563eb]/90"
    >
      <img src={plus} alt="" className="size-4" />
      Добавить
    </Button>
  );
};
