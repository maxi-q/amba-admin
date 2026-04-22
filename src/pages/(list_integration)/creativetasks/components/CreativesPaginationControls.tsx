import { Button } from "@senler/ui";

interface CreativesPaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  "aria-label"?: string;
  className?: string;
}

/**
 * Кнопки «Назад / Вперёд» + номер страницы (вместо MUI Pagination).
 */
export function CreativesPaginationControls({
  page,
  totalPages,
  onPageChange,
  "aria-label": ariaLabel = "Постраничная навигация",
  className = "",
}: CreativesPaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex items-center justify-center gap-2 ${className}`.trim()}
      role="navigation"
      aria-label={ariaLabel}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Назад
      </Button>
      <span className="min-w-[4.5rem] text-center text-sm text-muted-foreground tabular-nums">
        {page} / {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Вперёд
      </Button>
    </div>
  );
}
