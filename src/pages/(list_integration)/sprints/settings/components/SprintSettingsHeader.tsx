interface SprintSettingsHeaderProps {
  activeSprints: number;
  totalSprints: number;
}

export const SprintSettingsHeader = ({
  activeSprints,
  totalSprints,
}: SprintSettingsHeaderProps) => {
  return (
    <div className="mb-4 flex justify-end">
      <div className="text-right text-sm text-muted-foreground">
        <p>Активных спринтов: {activeSprints}</p>
        <p>Всего спринтов: {totalSprints}</p>
      </div>
    </div>
  );
};
