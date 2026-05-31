import { InputField } from "@senler/ui";

const getFirstFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  fieldErrors[fieldName]?.[0] || "";
const hasFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  Boolean(fieldErrors[fieldName]?.length);

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
