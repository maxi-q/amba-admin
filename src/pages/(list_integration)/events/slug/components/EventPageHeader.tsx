import { Button } from "@senler/ui";
import { useParams } from "react-router-dom";

interface EventPageHeaderProps {
  onCopyEventId: () => void;
}

export const EventPageHeader = ({ onCopyEventId }: EventPageHeaderProps) => {
  const { eventId } = useParams();
  const isNewEvent = eventId === "new";

  if (isNewEvent) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center justify-end">
      <Button
        type="button"
        variant="link"
        className="h-auto px-0 text-[13px] font-normal"
        onClick={onCopyEventId}
      >
        Скопировать ID события
      </Button>
    </div>
  );
};
