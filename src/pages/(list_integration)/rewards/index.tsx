import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  InputField,
  PageLoader,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@senler/ui";
import type { BaseRewardDto } from "@/api/generated/model";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomRewards } from "@/hooks/rewards/useRoomRewards";
import {
  useCreateReward,
  useDeleteReward,
  useUpdateReward,
} from "@/hooks/rewards/useRewardMutations";

type RewardFormState = {
  name: string;
  iconFile: File | null;
  existingIconUrl: string | null;
};

const emptyForm = (): RewardFormState => ({
  name: "",
  iconFile: null,
  existingIconUrl: null,
});

export default function RewardsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading: isRoomLoading } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";
  const { rewards, isLoading, isError, error, refetch } = useRoomRewards(roomId, {
    page: 1,
    size: 100,
    includeDeleted: false,
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<BaseRewardDto | null>(null);
  const [form, setForm] = useState<RewardFormState>(emptyForm);

  const { createReward, isPending: isCreating, generalError: createError, validationErrors: createErrors } =
    useCreateReward();
  const { updateReward, isPending: isUpdating, generalError: updateError, validationErrors: updateErrors } =
    useUpdateReward();
  const { deleteReward, isPending: isDeleting } = useDeleteReward(roomId);

  const isPending = isCreating || isUpdating || isDeleting;
  const generalError = createError || updateError;
  const validationErrors = editing ? updateErrors : createErrors;

  useEffect(() => {
    if (!sheetOpen) {
      setEditing(null);
      setForm(emptyForm());
    }
  }, [sheetOpen]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setSheetOpen(true);
  };

  const openEdit = (reward: BaseRewardDto) => {
    setEditing(reward);
    setForm({
      name: reward.name,
      iconFile: null,
      existingIconUrl: reward.iconUrl,
    });
    setSheetOpen(true);
  };

  const handleSubmit = () => {
    if (!roomId || !form.name.trim()) return;

    if (editing) {
      updateReward(
        {
          id: editing.id,
          data: {
            name: form.name.trim(),
          },
          iconFile: form.iconFile,
        },
        {
          onSuccess: () => {
            toast.success("Награда обновлена");
            setSheetOpen(false);
            void refetch();
          },
        }
      );
      return;
    }

    if (!form.iconFile) return;

    createReward(
      {
        name: form.name.trim(),
        roomId,
        iconFile: form.iconFile,
      },
      {
        onSuccess: () => {
          toast.success("Награда создана");
          setSheetOpen(false);
          void refetch();
        },
      }
    );
  };

  const handleDelete = (reward: BaseRewardDto) => {
    if (!window.confirm(`Удалить награду «${reward.name}»?`)) return;
    deleteReward(reward.id, {
      onSuccess: () => {
        toast.success("Награда удалена");
        void refetch();
      },
    });
  };

  if (isRoomLoading || isLoading) {
    return (
      <div className="flex justify-center py-10">
        <PageLoader label="Загрузка наград…" />
      </div>
    );
  }

  return (
    <div className="w-full px-2 py-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Награды</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Каталог наград компании. Используются в правилах выдачи наград спринтов.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          Создать награду
        </Button>
      </div>

      {isError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error instanceof Error ? error.message : "Не удалось загрузить награды"}
          </AlertDescription>
        </Alert>
      ) : null}

      {rewards.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Наград пока нет. Создайте первую награду для правил спринта.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {rewards.map((reward) => (
            <Card key={reward.id} className="border border-border shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                {reward.iconUrl ? (
                  <img
                    src={reward.iconUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                    —
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{reward.name}</p>
                  {reward.isDeleted ? <Badge variant="outline">Удалена</Badge> : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Изменить"
                  onClick={() => openEdit(reward)}
                  disabled={isPending}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Удалить"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(reward)}
                  disabled={isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex !max-h-[min(100dvh,28rem)] flex-col gap-0 overflow-hidden rounded-t-2xl border-0 p-0 sm:mx-auto sm:max-w-lg"
        >
          <SheetHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setSheetOpen(false)}
              aria-label="Закрыть"
            >
              <X className="size-5" />
            </Button>
            <SheetTitle className="flex-1 text-left text-lg font-medium text-primary-foreground">
              {editing ? "Изменить награду" : "Создать награду"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 px-4 py-4">
            {generalError ? (
              <Alert variant="destructive">
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Название *</p>
              <InputField
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                error={!!validationErrors.name?.length}
                helperText={validationErrors.name?.[0]}
                aria-label="Название награды"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Иконка {!editing ? "*" : ""}
              </p>
              {form.existingIconUrl && !form.iconFile ? (
                <img
                  src={form.existingIconUrl}
                  alt=""
                  className="size-16 rounded-md border border-border object-cover"
                />
              ) : null}
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    iconFile: event.target.files?.[0] ?? null,
                  }))
                }
                aria-label="Иконка награды"
              />
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP или GIF, до 10 МБ
              </p>
            </div>
          </div>

          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setSheetOpen(false)} disabled={isPending}>
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                isPending ||
                !form.name.trim() ||
                (!editing && !form.iconFile)
              }
            >
              {isPending ? "Сохранение…" : editing ? "Сохранить" : "Создать"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
