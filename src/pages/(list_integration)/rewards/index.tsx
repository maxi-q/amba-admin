import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useParams } from "react-router-dom";
import {
  Eye,
  Gift,
  ImageIcon,
  Info,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  Button,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  InputField,
  PageLoader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@senler/ui";
import type { BaseRewardDto, RewardPhotoDto } from "@/api/generated/model";
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
  existingPhotos: RewardPhotoDto[];
  photoFiles: File[];
  removedPhotoIds: string[];
  isDivisible: boolean;
  divisionPrecision: number;
};

const emptyForm = (): RewardFormState => ({
  name: "",
  iconFile: null,
  existingIconUrl: null,
  existingPhotos: [],
  photoFiles: [],
  removedPhotoIds: [],
  isDivisible: false,
  divisionPrecision: 1,
});

const precisionValue = (precision: number) =>
  `0,${"0".repeat(Math.max(0, precision - 1))}1`;

const precisionLabel = (reward: BaseRewardDto) =>
  reward.isDivisible
    ? `точность ${precisionValue(reward.divisionPrecision)}`
    : "точность до целого";

// ponytail: в контракте нет isSystem/isEditable; заменить проверку серверным флагом.
const isSystemReward = (reward: BaseRewardDto) =>
  reward.name.trim().toLocaleLowerCase("ru") === "рубли";

function RewardImagePicker({
  form,
  setForm,
}: {
  form: RewardFormState;
  setForm: Dispatch<SetStateAction<RewardFormState>>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerMode = useRef<"icon" | "gallery">("icon");
  const localUrls = useMemo(
    () =>
      [form.iconFile, ...form.photoFiles]
        .filter((file): file is File => Boolean(file))
        .map((file) => URL.createObjectURL(file)),
    [form.iconFile, form.photoFiles]
  );

  useEffect(
    () => () => localUrls.forEach((url) => URL.revokeObjectURL(url)),
    [localUrls]
  );

  const iconUrl = form.iconFile ? localUrls[0] : form.existingIconUrl;
  const photoUrlOffset = form.iconFile ? 1 : 0;
  const gallery = [
    ...form.existingPhotos.map((photo) => ({
      key: photo.id,
      url: photo.url,
      photo,
      fileIndex: -1,
    })),
    ...form.photoFiles.map((_, fileIndex) => ({
      key: `file-${fileIndex}`,
      url: localUrls[fileIndex + photoUrlOffset],
      photo: null,
      fileIndex,
    })),
  ];

  const openPicker = (mode: "icon" | "gallery") => {
    pickerMode.current = mode;
    inputRef.current?.click();
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length === 0) return;
    if (selected.length > 3) {
      toast.message("Можно выбрать не больше трех изображений за раз");
    }
    const files = selected.slice(0, 3);

    setForm((previous) => {
      if (pickerMode.current === "icon") {
        return {
          ...previous,
          iconFile: files[0],
          photoFiles: [...previous.photoFiles, ...files.slice(1)],
        };
      }
      return { ...previous, photoFiles: [...previous.photoFiles, ...files] };
    });
  };

  const removePhoto = (photo: RewardPhotoDto | null, fileIndex: number) => {
    setForm((previous) =>
      photo
        ? {
            ...previous,
            existingPhotos: previous.existingPhotos.filter((item) => item.id !== photo.id),
            removedPhotoIds: [...previous.removedPhotoIds, photo.id],
          }
        : {
            ...previous,
            photoFiles: previous.photoFiles.filter((_, index) => index !== fileIndex),
          }
    );
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={handleFiles}
        aria-label="Изображения награды"
      />

      {iconUrl ? (
        <div className="grid h-[241px] grid-cols-[minmax(0,1fr)_72px] gap-3">
          <button
            type="button"
            className="overflow-hidden rounded-md bg-[#f0f0f0] text-left"
            onClick={() => openPicker("icon")}
            aria-label="Заменить основное изображение"
          >
            <img
              src={iconUrl}
              alt="Изображение награды"
              className="size-full object-cover"
            />
          </button>
          <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
            {gallery.map((item) => (
              <div
                key={item.key}
                className="group relative aspect-square shrink-0 overflow-hidden rounded-md bg-[#f0f0f0]"
              >
                <img src={item.url} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-black/45 text-white"
                  onClick={() => removePhoto(item.photo, item.fileIndex)}
                  aria-label="Удалить изображение"
                >
                  <X className="size-3" strokeWidth={2} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="flex aspect-square shrink-0 items-center justify-center rounded-md border-2 border-dashed border-[#2563eb] text-[#797979] hover:bg-[#f7f9ff]"
              onClick={() => openPicker("gallery")}
              aria-label="Добавить изображения"
            >
              <span className="relative">
                <Plus className="size-6" strokeWidth={1.5} />
                <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#21c55d] text-white">
                  <Plus className="size-3" strokeWidth={2} />
                </span>
              </span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex h-[241px] w-full flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-[#e4e4e4] px-2 py-6"
          onClick={() => openPicker("icon")}
        >
          <span className="flex flex-col items-center gap-2">
            <ImageIcon className="size-6 text-[#797979]" strokeWidth={1.5} />
            <span className="flex flex-col gap-1 text-center">
              <span className="text-[13px] font-medium leading-4 tracking-[-0.25px] text-black">
                Добавьте изображение награды
              </span>
              <span className="text-xs font-medium leading-4 text-[#797979]">
                До 3 одновременно
              </span>
            </span>
          </span>
          <span className="rounded-md border border-[#e4e4e4] bg-white px-2 py-1.5 text-[13px] font-medium leading-4 shadow-none">
            Выбрать файл
          </span>
        </button>
      )}
    </div>
  );
}

function RewardsPreview({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col bg-white">
      <div className="flex min-h-12 items-center gap-2 border-b border-[#e4e4e4] bg-[#fff7ed] px-4 py-2 text-[13px] font-medium leading-4 tracking-[-0.25px] text-black">
        <TriangleAlert className="size-4 shrink-0 text-[#f97316]" strokeWidth={1.5} />
        <p className="max-w-[850px]">
          Вы находитесь в режиме превью, где можно посмотреть, как награды будут распределяться в режиме спринта. Чтобы применить награды, необходимо создать спринт
        </p>
      </div>
      <header className="flex h-12 items-center justify-between border-b border-[#e4e4e4] px-4">
        <h1 className="text-[13px] font-medium leading-4 tracking-[-0.25px]">Превью</h1>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 border-[#e4e4e4] bg-white px-2 text-[13px] font-medium shadow-none"
          onClick={onExit}
        >
          <LogOut className="size-4" strokeWidth={1.5} />
          Выйти
        </Button>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,680px)_260px]">
        <div className="p-4">
          <div className="rounded-lg border border-[#e4e4e4] p-4">
            <h2 className="text-[15px] font-medium leading-5 tracking-[-0.9px]">Призовые места</h2>
            <p className="mt-1 text-[13px] font-medium leading-4 tracking-[-0.25px] text-[#797979]">
              Какие награды получит конкретное место в рейтинге
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 h-7 gap-1 border-[#e4e4e4] bg-white px-2 text-[13px] font-medium shadow-none"
              onClick={() => toast.message("Настройте призовые места при создании спринта")}
            >
              <Plus className="size-4" strokeWidth={1.5} />
              Добавить место
            </Button>
          </div>
        </div>
        <aside className="flex min-h-[300px] items-center justify-center border-l border-[#e4e4e4] p-6 text-center text-[13px] font-medium leading-4 text-[#797979]">
          Здесь будут отображаться
          <br />
          все награды
        </aside>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading: isRoomLoading } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";
  const { rewards, isLoading, isError, error, refetch } = useRoomRewards(roomId, {
    page: 1,
    size: 100,
    includeDeleted: false,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editing, setEditing] = useState<BaseRewardDto | null>(null);
  const [form, setForm] = useState<RewardFormState>(emptyForm);

  const {
    createReward,
    isPending: isCreating,
    generalError: createError,
    validationErrors: createErrors,
    resetCreateReward,
  } = useCreateReward();
  const {
    updateReward,
    isPending: isUpdating,
    generalError: updateError,
    validationErrors: updateErrors,
    resetUpdateReward,
  } = useUpdateReward();
  const {
    deleteReward,
    isPending: isDeleting,
    generalError: deleteError,
  } = useDeleteReward(roomId);

  const isPending = isCreating || isUpdating || isDeleting;
  const generalError = createError || updateError;
  const validationErrors = editing ? updateErrors : createErrors;

  useEffect(() => {
    if (!dialogOpen) {
      setEditing(null);
      setForm(emptyForm());
      resetCreateReward();
      resetUpdateReward();
    }
  }, [dialogOpen, resetCreateReward, resetUpdateReward]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (reward: BaseRewardDto) => {
    setEditing(reward);
    setForm({
      name: reward.name,
      iconFile: null,
      existingIconUrl: reward.iconUrl,
      existingPhotos: reward.photos,
      photoFiles: [],
      removedPhotoIds: [],
      isDivisible: reward.isDivisible,
      divisionPrecision: reward.divisionPrecision || 1,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!roomId || !form.name.trim()) return;
    const divisionPrecision = form.isDivisible ? form.divisionPrecision : 0;

    if (editing) {
      updateReward(
        {
          id: editing.id,
          data: {
            name: form.name.trim(),
            isDivisible: form.isDivisible,
            divisionPrecision,
          },
          iconFile: form.iconFile,
          photoFiles: form.photoFiles,
          photoIdsToDelete: form.removedPhotoIds,
        },
        {
          onSuccess: () => {
            toast.success("Награда обновлена");
            setDialogOpen(false);
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
        photoFiles: form.photoFiles,
        isDivisible: form.isDivisible,
        divisionPrecision,
      },
      {
        onSuccess: () => {
          toast.success("Награда создана");
          setDialogOpen(false);
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
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <PageLoader label="Загрузка наград…" />
      </div>
    );
  }

  return (
    <div className="-m-4 min-h-dvh w-[calc(100%+2rem)] min-w-0 bg-white md:-m-6 md:w-[calc(100%+3rem)]">
      {previewOpen ? (
        <RewardsPreview onExit={() => setPreviewOpen(false)} />
      ) : (
        <div className="flex min-h-dvh min-w-0 flex-col">
          <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[#e4e4e4] px-4">
            <h1 className="text-[13px] font-medium leading-4 tracking-[-0.25px] text-black">
              Награды
            </h1>
            <div className="flex items-center gap-1">
              {rewards.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 border-[#e4e4e4] bg-white px-2 text-[13px] font-medium shadow-none"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="size-4" strokeWidth={1.5} />
                  Превью
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                className="h-7 gap-1 bg-[#2563eb] px-2 text-[13px] font-medium hover:bg-[#2563eb]/90"
                onClick={openCreate}
              >
                <Plus className="size-4" strokeWidth={1.5} />
                Добавить
              </Button>
            </div>
          </header>

          {isError || deleteError ? (
            <Alert variant="destructive" className="m-4">
              <AlertDescription>
                {deleteError || (error instanceof Error ? error.message : "Не удалось загрузить награды")}
              </AlertDescription>
            </Alert>
          ) : null}

          {rewards.length === 0 && !isError ? (
            <Empty className="min-h-0 flex-1 gap-3 border-0 p-6 md:p-12">
              <EmptyHeader className="max-w-[320px] gap-1">
                <EmptyTitle className="text-[14px] font-semibold leading-5 tracking-[-0.25px] text-black">
                  Награды еще не добавлены
                </EmptyTitle>
                <EmptyDescription className="text-[13px] font-normal leading-4 text-[#797979] no-underline">
                  Создавайте вознаграждения за выполнение заданий для исполнителей
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="max-w-[320px]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 border-[#e4e4e4] bg-white px-2 text-[13px] font-medium shadow-none"
                  onClick={openCreate}
                >
                  <Plus className="size-4" strokeWidth={1.5} />
                  Добавить
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="flex flex-col">
              {rewards.map((reward) => {
                const system = isSystemReward(reward);
                const imageUrl = reward.iconUrl ?? reward.photos[0]?.url;
                return (
                  <div
                    key={reward.id}
                    className="flex h-16 min-w-0 items-center gap-1.5 border-b border-[#e4e4e4] px-4 py-2"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e4e4e4] bg-[#f0f0f0]">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <Gift className="size-6 text-[#797979]" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium leading-4 tracking-[-0.25px] text-black">
                        {reward.name}
                      </p>
                      <p className="mt-1 truncate text-[11px] font-medium uppercase leading-4 tracking-[0.3px] text-[#797979]">
                        {precisionLabel(reward)}
                      </p>
                    </div>
                    {!system ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-7 border-[#e4e4e4] bg-white text-[#797979] shadow-none"
                          aria-label={`Изменить награду «${reward.name}»`}
                          onClick={() => openEdit(reward)}
                          disabled={isPending}
                        >
                          <Pencil className="size-4" strokeWidth={1.5} />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-7 border-[#e4e4e4] bg-white text-[#797979] shadow-none hover:text-destructive"
                          aria-label={`Удалить награду «${reward.name}»`}
                          onClick={() => handleDelete(reward)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[min(705px,calc(100dvh-2rem))] w-[min(358px,calc(100vw-2rem))] gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 sm:max-w-[358px]"
        >
          <DialogHeader className="h-11 shrink-0 flex-row items-center gap-4 space-y-0 px-4 py-2.5">
            <DialogTitle className="flex-1 text-left text-[15px] font-medium leading-5 tracking-[-0.9px] text-black">
              Награда
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon_sm"
              className="size-6 text-[#797979]"
              onClick={() => setDialogOpen(false)}
              aria-label="Закрыть"
            >
              <X className="size-5" strokeWidth={1.5} />
            </Button>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-3">
            <RewardImagePicker form={form} setForm={setForm} />

            <div className="space-y-2">
              <label className="block text-[13px] font-medium leading-4 tracking-[-0.25px] text-[#797979]">
                Название награды <span className="text-red-500">*</span>
              </label>
              <InputField
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, name: event.target.value }))
                }
                error={Boolean(validationErrors.name?.length)}
                helperText={validationErrors.name?.[0]}
                className="h-10 border-[#e4e4e4] text-[13px] shadow-none"
                aria-label="Название награды"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[13px] font-medium leading-4 tracking-[-0.25px] text-[#797979]">
                Как делить награду
              </p>
              <div className="flex gap-2 rounded-[10px] bg-[#f0f0f0] p-2 text-[13px] font-medium leading-4 tracking-[-0.25px] text-black">
                <Info className="mt-px size-4 shrink-0 text-[#2563eb]" strokeWidth={1.5} />
                <p>Укажите, как будет делиться награда при пропорциональном распределении</p>
              </div>
              <TabsRoot
                value={form.isDivisible ? "fractional" : "integer"}
                onValueChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    isDivisible: value === "fractional",
                  }))
                }
              >
                <TabsList className="grid h-7 w-full grid-cols-2 gap-0.5 rounded-md bg-[#f0f0f0] p-0.5">
                  <TabsTrigger value="integer" className="justify-center">
                    До целого числа
                  </TabsTrigger>
                  <TabsTrigger value="fractional" className="justify-center">
                    До дроби
                  </TabsTrigger>
                </TabsList>
              </TabsRoot>
              {form.isDivisible ? (
                <div className="space-y-1">
                  <Select
                    value={String(form.divisionPrecision)}
                    onValueChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        divisionPrecision: Number(value),
                      }))
                    }
                  >
                    <SelectTrigger className="h-10 w-full border-[#e4e4e4] bg-white text-[13px] shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, index) => index + 1).map((precision) => (
                        <SelectItem key={precision} value={String(precision)}>
                          {precisionValue(precision)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.divisionPrecision?.[0] ? (
                    <p className="text-xs text-destructive">
                      {validationErrors.divisionPrecision[0]}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {generalError ? (
              <Alert variant="destructive">
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            ) : null}
          </div>

          <DialogFooter className="h-12 shrink-0 flex-row items-center justify-end px-4 py-2.5 sm:justify-end">
            <Button
              type="button"
              className="h-7 bg-[#2563eb] px-2 text-[13px] font-medium hover:bg-[#2563eb]/90"
              onClick={handleSubmit}
              disabled={isPending || !form.name.trim() || (!editing && !form.iconFile)}
            >
              {isCreating || isUpdating ? "Сохранение…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
