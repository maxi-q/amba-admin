import { Plus } from "lucide-react";
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@senler/ui";

interface SprintsEmptyStateProps {
  onCreateClick: () => void;
}

export const SprintsEmptyState = ({ onCreateClick }: SprintsEmptyStateProps) => {
  return (
    <Empty className="min-h-0 flex-1 gap-3 border-0 p-6 md:p-12">
      <EmptyHeader className="max-w-[320px] gap-1">
        <EmptyTitle className="text-[14px] font-semibold leading-5 tracking-[-0.25px] text-foreground">
          Спринт еще не добавлен
        </EmptyTitle>
        <EmptyDescription className="text-[13px] font-normal leading-4 text-[#797979] no-underline">
          Создавайте задания, которые будут выполнять все участники
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-[320px]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 border-[#e4e4e4] bg-[#FFFFFF] px-2 text-[13px] font-medium text-foreground shadow-none hover:bg-[#f7f7f7]"
          onClick={onCreateClick}
        >
          <Plus className="size-4" aria-hidden />
          Добавить
        </Button>
      </EmptyContent>
    </Empty>
  );
};
