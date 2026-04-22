import { PageLoader } from "@senler/ui";

export const SettingsLoadingState = () => {
  return (
    <div className="flex min-h-[200px] w-full items-center justify-center">
      <PageLoader label="Загрузка…" />
    </div>
  );
};
