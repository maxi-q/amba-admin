import { Button } from "@senler/ui";
import helpIcon from "@/assets/sprint-instructions/help.svg";
import plusIcon from "@/assets/sprint-instructions/plus.svg";

interface SprintsPageToolbarProps {
  onCreateClick: () => void;
  onInstructionsClick?: () => void;
}

/** Локальная шапка списка спринтов: «Спринт» + «+ Добавить» */
export const SprintsPageToolbar = ({
  onCreateClick,
  onInstructionsClick,
}: SprintsPageToolbarProps) => {
  return (
    <header className="flex h-12 min-w-0 shrink-0 items-center justify-between gap-2 border-b border-[#e4e4e4] px-4">
      <h1 className="text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
        Спринт
      </h1>
      <div className="flex shrink-0 items-center gap-2">
        {onInstructionsClick ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 border-[#e4e4e4] bg-white px-2 text-[13px] font-medium leading-4 shadow-none"
            onClick={onInstructionsClick}
          >
            <img src={helpIcon} alt="" />
            Инструкция
          </Button>
        ) : null}
        <Button
          type="button"
          variant="default"
          size="sm"
          className="h-7 gap-1 bg-[#2563eb] px-2 text-[13px] font-medium hover:bg-[#2563eb]/90"
          onClick={onCreateClick}
        >
          <img src={plusIcon} alt="" />
          Добавить
        </Button>
      </div>
    </header>
  );
};
