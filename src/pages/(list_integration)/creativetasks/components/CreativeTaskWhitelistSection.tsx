import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  InputField,
  PageLoader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@senler/ui";
import { useCreativeTaskWhitelist } from "@/hooks/creativetasks/useCreativeTaskWhitelist";
import { useAddToCreativeTaskWhitelist } from "@/hooks/creativetasks/useAddToCreativeTaskWhitelist";
import { useRemoveFromCreativeTaskWhitelist } from "@/hooks/creativetasks/useRemoveFromCreativeTaskWhitelist";
import { useAmbassadors } from "@/hooks/ambassador/useAmbassadors";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { CreativesPaginationControls } from "./CreativesPaginationControls";
import type { ICreativeTask } from "@services/creativetasks/creativetasks.types";
import type { IAmbassador } from "@services/ambassador/ambassador.types";

const NONE = "__none__";

interface CreativeTaskWhitelistSectionProps {
  task: ICreativeTask;
}

function getOptionLabel(a: IAmbassador) {
  if (a.promoCode) return `${a.promoCode} (${a.id.slice(0, 8)}…)`;
  return a.id;
}

export function CreativeTaskWhitelistSection({ task }: CreativeTaskWhitelistSectionProps) {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [ambassadorIdInput, setAmbassadorIdInput] = useState("");
  const [selectedAmbassadorId, setSelectedAmbassadorId] = useState(NONE);
  const [searchQuery, setSearchQuery] = useState("");

  const { room } = useGetRoomById(slug ?? "");

  const { items, isLoading, pagination } = useCreativeTaskWhitelist(task.id, {
    page,
    size: pageSize,
  });

  const {
    addToWhitelist,
    isPending: isAdding,
    generalError: addGeneralError,
    validationErrors: addValidationErrors,
  } = useAddToCreativeTaskWhitelist();

  const {
    removeFromWhitelist,
    isPending: isRemoving,
    generalError: removeGeneralError,
  } = useRemoveFromCreativeTaskWhitelist();

  const {
    ambassadors,
    isLoading: isLoadingAmbassadors,
  } = useAmbassadors({
    page: 1,
    size: 100,
    roomIds: room?.id ? ([room.id] as unknown as number[]) : undefined,
  });

  const ambassadorOptions = useMemo(() => ambassadors ?? [], [ambassadors]);

  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return ambassadorOptions;
    const q = searchQuery.toLowerCase().trim();
    return ambassadorOptions.filter(
      (a) =>
        a.promoCode?.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    );
  }, [ambassadorOptions, searchQuery]);

  const promoByAmbassadorId = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of ambassadorOptions) {
      if (a.id) m.set(a.id, a.promoCode);
    }
    return m;
  }, [ambassadorOptions]);

  const handleAddById = () => {
    const id = ambassadorIdInput.trim();
    if (!id) return;
    addToWhitelist({ taskId: task.id, data: { ambassadorId: id } });
    setAmbassadorIdInput("");
  };

  const handleAddSelected = () => {
    if (selectedAmbassadorId === NONE) return;
    addToWhitelist({
      taskId: task.id,
      data: { ambassadorId: selectedAmbassadorId },
    });
    setSelectedAmbassadorId(NONE);
  };

  const handleRemove = (ambassadorId: string) => {
    removeFromWhitelist({ taskId: task.id, ambassadorId });
  };

  const whitelistDisabled = task.isWhitelistEnabled === false;

  return (
    <Card className="mt-6 border border-border bg-card shadow-sm">
      <CardContent className="space-y-3 p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Вайтлист</h2>
        <p className="text-sm text-muted-foreground">
          Только амбассадоры из списка могут участвовать в задании, если включён вайтлист в
          настройках задачи.
        </p>

        {whitelistDisabled ? (
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <AlertDescription>
              Вайтлист для этой задачи отключён. Включите «Вайтлист» в настройках задачи при
              редактировании.
            </AlertDescription>
          </Alert>
        ) : null}

        {(addGeneralError || removeGeneralError) && (
          <Alert variant="destructive">
            <AlertDescription>
              {addGeneralError || removeGeneralError}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="grid w-full max-w-md gap-2">
            <p className="text-sm font-medium text-foreground">
              Добавить по ID амбассадора (UUID)
            </p>
            <InputField
              className="w-full min-w-0"
              value={ambassadorIdInput}
              onChange={(e) => setAmbassadorIdInput(e.target.value)}
              error={!!addValidationErrors?.ambassadorId?.length}
              helperText={addValidationErrors?.ambassadorId?.[0]}
              disabled={whitelistDisabled}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              aria-label="UUID амбассадора"
            />
            <Button
              type="button"
              size="lg"
              className="h-10 w-full"
              onClick={handleAddById}
              disabled={whitelistDisabled || isAdding || !ambassadorIdInput.trim()}
            >
              {isAdding ? "…" : "Добавить"}
            </Button>
          </div>

          {room?.id ? (
            <div className="grid w-full max-w-md gap-2">
              <p className="text-sm font-medium text-foreground">
                Или выберите амбассадора комнаты
              </p>
              {isLoadingAmbassadors ? (
                <p className="text-sm text-muted-foreground">Загрузка списка…</p>
              ) : null}
              <InputField
                className="w-full min-w-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={whitelistDisabled || isLoadingAmbassadors}
                placeholder="Поиск по промокоду / id"
                aria-label="Поиск амбассадора"
              />
              <Select
                value={selectedAmbassadorId}
                onValueChange={setSelectedAmbassadorId}
                disabled={whitelistDisabled || isLoadingAmbassadors}
              >
                <SelectTrigger className="h-10 w-full" aria-label="Амбассадор из списка">
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>—</SelectItem>
                  {filteredBySearch.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {getOptionLabel(a)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-10 w-full"
                onClick={handleAddSelected}
                disabled={
                  whitelistDisabled || isLoadingAmbassadors || isAdding || selectedAmbassadorId === NONE
                }
              >
                Добавить
              </Button>
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <PageLoader label="Загрузка…" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">В вайтлисте пока никого нет.</p>
        ) : (
          <>
            <ul className="space-y-2" aria-label="Вайтлист">
              {items.map((row) => {
                const promo =
                  row.promoCode?.trim() ||
                  promoByAmbassadorId.get(row.ambassadorId) ||
                  "—";
                return (
                  <li
                    key={row.ambassadorId}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 py-2 pl-3 pr-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm text-muted-foreground">Промокод:</span>
                        <Badge variant="secondary" className="font-mono text-xs sm:text-sm">
                          {promo}
                        </Badge>
                      </div>
                      <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                        ID: {row.ambassadorId}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(row.ambassadorId)}
                      disabled={whitelistDisabled || isRemoving}
                      aria-label="Убрать из вайтлиста"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>

            {pagination && pagination.totalPages > 1 ? (
              <CreativesPaginationControls
                page={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                className="pt-2"
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
