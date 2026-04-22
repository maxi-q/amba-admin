import type { FilterSelectorProps } from "../../types";
import { AmbassadorAutocomplete } from "../AmbassadorAutocomplete";
import { SprintAutocomplete } from "../SprintAutocomplete";
import { EventAutocomplete } from "../EventAutocomplete";

export const FilterSelector = ({
  selectedAmbassadors,
  selectedSprints,
  selectedEvents,
  onAmbassadorsChange,
  onSprintsChange,
  onEventsChange,
  roomId,
}: FilterSelectorProps & { roomId: string }) => {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <AmbassadorAutocomplete
        selectedIds={selectedAmbassadors}
        onChange={onAmbassadorsChange}
      />
      <SprintAutocomplete
        selectedIds={selectedSprints}
        onChange={onSprintsChange}
        roomId={roomId}
      />
      <EventAutocomplete
        selectedIds={selectedEvents}
        onChange={onEventsChange}
        roomId={roomId}
      />
    </div>
  );
};
