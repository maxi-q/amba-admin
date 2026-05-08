import { Button, Card, CardContent, PageLoader } from "@senler/ui";
import type { EventListProps, EventData } from "../../types";

export const EventList = ({
  events,
  onLoadMore,
  onExport,
  total,
  hasMore = false,
  isLoadingMore = false,
  isExporting = false,
  isExportDisabled = false,
  isLoading = false,
  exportError,
}: EventListProps) => {
  if (isLoading && events.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Количество: {total ?? "—"}
        </h3>
        {onExport ? (
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onExport}
            disabled={isExporting || isExportDisabled}
          >
            {isExporting ? "Выгрузка…" : "Выгрузить CSV"}
          </Button>
        ) : null}
      </div>

      {exportError ? (
        <p className="mb-3 text-sm text-destructive">{exportError}</p>
      ) : null}

      <div className="flex flex-col gap-3">
        {events.map((event: EventData) => (
          <Card key={event.id} className="border border-border shadow-sm">
            <CardContent className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-base font-medium text-foreground">{event.name}</p>
              <p className="text-sm text-muted-foreground">
                {event.event} {event.date}
              </p>
            </CardContent>
          </Card>
        ))}

        {hasMore && onLoadMore ? (
          <Button
            type="button"
            variant="outline"
            className="mt-1 w-full sm:w-auto"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Загрузка…" : "Загрузить ещё"}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
