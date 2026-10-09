import { Button } from "@senler/ui";
import { EventInstructions } from "./EventInstructions";

interface EventsEmptyStateProps {
  onCreateClick: () => void;
}

export const EventsEmptyState = ({ onCreateClick }: EventsEmptyStateProps) => {
  return (
    <section className="flex min-h-[664px] justify-center px-4 pb-10 pt-10">
      <div className="flex w-[326px] max-w-full flex-col items-center gap-3">
        <EventInstructions />
        <Button
          type="button"
          onClick={onCreateClick}
          className="h-10 bg-[#2563eb] px-3 text-[13px] font-medium leading-4 shadow-none hover:bg-[#2563eb]/90"
        >
          Создать первое событие
        </Button>
      </div>
    </section>
  );
};
