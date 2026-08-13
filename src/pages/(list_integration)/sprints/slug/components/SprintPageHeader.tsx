import { Button } from "@senler/ui";
import { useLocation, useParams } from "react-router-dom";

interface SprintPageHeaderProps {
  /** Зарезервировано под подзаголовок / контекст */
  sprintName?: string;
  onCopySprintId: () => void;
}

export const SprintPageHeader = ({
  onCopySprintId,
}: SprintPageHeaderProps) => {
  const { sprintId } = useParams();
  const { pathname } = useLocation();
  const isNewSprint =
    sprintId === "new" || /\/sprints\/new\/?$/.test(pathname);

  if (isNewSprint) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center justify-end">
      <Button
        type="button"
        variant="link"
        className="h-auto px-0 text-[13px] font-normal"
        onClick={onCopySprintId}
      >
        Скопировать ID спринта
      </Button>
    </div>
  );
};
