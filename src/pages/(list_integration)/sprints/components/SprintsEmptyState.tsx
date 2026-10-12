import { Button } from "@senler/ui";
import { SprintInstructions } from "./SprintInstructions";

interface SprintsEmptyStateProps {
  onCreateClick: () => void;
}

export const SprintsEmptyState = ({ onCreateClick }: SprintsEmptyStateProps) => {
  return (
    <section className="flex min-h-[664px] flex-1 justify-center px-4 pb-4 pt-10">
      <div className="flex w-[326px] max-w-full flex-col items-center gap-3">
        <SprintInstructions />
        <Button
          type="button"
          onClick={onCreateClick}
          className="h-10 bg-[#2563eb] px-3 text-[13px] font-medium leading-4 shadow-none hover:bg-[#2563eb]/90"
        >
          Создать первый спринт
        </Button>
      </div>
    </section>
  );
};
