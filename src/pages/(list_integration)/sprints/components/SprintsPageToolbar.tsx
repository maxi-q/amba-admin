import { Plus } from "lucide-react";
import { Button } from "@senler/ui";

interface SprintsPageToolbarProps {
  onCreateClick: () => void;
}

/** Локальная шапка списка спринтов: «Спринт» + «+ Добавить» */
export const SprintsPageToolbar = ({
  onCreateClick,
}: SprintsPageToolbarProps) => {
  return (
    <header className="-mt-4 flex h-11 min-w-0 shrink-0 items-center justify-between gap-3 border-b border-[#e4e4e4] md:-mt-6">
      <h1 className="text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
        Спринт
      </h1>
      <Button
        type="button"
        variant="default"
        size="sm"
        className="h-7 gap-1 bg-[#2563eb] px-2 text-[13px] font-medium hover:bg-[#2563eb]/90"
        onClick={onCreateClick}
      >
        <Plus className="size-4" aria-hidden />
        Добавить
      </Button>
    </header>
  );
};
