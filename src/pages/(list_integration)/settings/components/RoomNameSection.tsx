import { InputField } from "@senler/ui";
import { getFirstFieldError, hasFieldError } from "@services/config/axios.helper";

interface RoomNameSectionProps {
  roomName: string;
  onChange: (value: string) => void;
  fieldErrors?: Record<string, string[]>;
}

export const RoomNameSection = ({
  roomName,
  onChange,
  fieldErrors,
}: RoomNameSectionProps) => {
  const errs = fieldErrors ?? {};

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Название</p>
      <InputField
        value={roomName}
        onChange={(e) => onChange(e.target.value)}
        error={hasFieldError(errs, "name")}
        helperText={getFirstFieldError(errs, "name") ?? undefined}
        aria-label="Название комнаты"
      />
    </div>
  );
};
