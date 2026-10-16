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
  CheckBox,
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
  Textarea,
} from "@senler/ui";
import type { BaseRewardDto, RewardPhotoDto } from "@/api/generated/model";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomRewards } from "@/hooks/rewards/useRoomRewards";
import {
  useCreateReward,
  useDeleteReward,
  useUpdateReward,
} from "@/hooks/rewards/useRewardMutations";
import {
  useApplyRewardVersions,
  useRewardUsageTargets,
  type RewardUsageTarget,
} from "@/hooks/rewards/useRewardVersionPropagation";
import {
  SprintCreationStepTwo,
  type DraftManualReward,
  type DraftProportionalReward,
  type DraftRankRule,
} from "../sprints/slug/components/SprintCreationStepTwo";

type RewardFormState = {
  name: string;
  description: string;
  iconFile: File | null;
  existingIconUrl: string | null;
  deleteExistingIcon: boolean;
  existingPhotos: RewardPhotoDto[];
  photoFiles: File[];
  removedPhotoIds: string[];
  isDivisible: boolean;
  divisionPrecision: number;
};

const emptyForm = (): RewardFormState => ({
  name: "",
  description: "",
  iconFile: null,
  existingIconUrl: null,
  deleteExistingIcon: false,
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

const usageTargetKey = (target: RewardUsageTarget) =>
  `${target.kind}:${target.id}`;

function RewardImagePicker({
  form,
  setForm,
}: {
  form: RewardFormState;
  setForm: Dispatch<SetStateAction<RewardFormState>>;
}) {
  const maxImages = 3;
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerMode = useRef<"icon" | "gallery">("icon");
  const [selectedImageKey, setSelectedImageKey] = useState("icon");
  const localUrls = useMemo(
    () =>
      [form.iconFile, ...form.photoFiles]
        .filter((file): file is File => Boolean(file))
        .map((file) => URL.createObjectURL(file)),
    [form.iconFile, form.photoFiles],
  );

  useEffect(
    () => () => localUrls.forEach((url) => URL.revokeObjectURL(url)),
    [localUrls],
  );

  const iconUrl = form.iconFile ? localUrls[0] : form.existingIconUrl;
  const photoUrlOffset = form.iconFile ? 1 : 0;
  const images = useMemo(
    () => [
      ...(iconUrl
        ? [
            {
              key: "icon",
              url: iconUrl,
              kind: "icon" as const,
              photo: null,
              fileIndex: -1,
              removable: true,
            },
          ]
        : []),
      ...form.existingPhotos.map((photo) => ({
        key: photo.id,
        url: photo.url,
        kind: "photo" as const,
        photo,
        fileIndex: -1,
        removable: true,
      })),
      ...form.photoFiles.map((_, fileIndex) => ({
        key: `file-${fileIndex}`,
        url: localUrls[fileIndex + photoUrlOffset],
        kind: "photo" as const,
        photo: null,
        fileIndex,
        removable: true,
      })),
    ],
    [
      form.existingPhotos,
      form.iconFile,
      form.photoFiles,
      iconUrl,
      localUrls,
      photoUrlOffset,
    ],
  );
  const selectedImage =
    images.find((image) => image.key === selectedImageKey) ?? images[0];

  useEffect(() => {
    if (
      images.length > 0 &&
      !images.some((image) => image.key === selectedImageKey)
    ) {
      setSelectedImageKey(images[0].key);
    }
  }, [images, selectedImageKey]);

  const openPicker = (mode: "icon" | "gallery") => {
    pickerMode.current = mode;
    inputRef.current?.click();
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length === 0) return;
    const nonIconCount = images.length - (iconUrl ? 1 : 0);
    const available =
      pickerMode.current === "icon"
        ? Math.max(0, maxImages - nonIconCount)
        : Math.max(0, maxImages - images.length);
    if (available === 0) {
      toast.message("Можно добавить не больше трех изображений");
      return;
    }
    if (selected.length > available) {
      toast.message("Можно добавить не больше трех изображений");
    }
    const files = selected.slice(0, available);

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
    if (pickerMode.current === "icon") setSelectedImageKey("icon");
  };

  const removeImage = (
    kind: "icon" | "photo",
    photo: RewardPhotoDto | null,
    fileIndex: number,
  ) => {
    if (kind === "icon") {
      setForm((previous) => {
        if (previous.iconFile && previous.existingIconUrl) {
          return { ...previous, iconFile: null };
        }
        if (previous.existingIconUrl) {
          return {
            ...previous,
            existingIconUrl: null,
            deleteExistingIcon: true,
          };
        }
        const [nextIcon = null, ...remainingPhotos] = previous.photoFiles;
        return {
          ...previous,
          iconFile: nextIcon,
          photoFiles: remainingPhotos,
        };
      });
      setSelectedImageKey("icon");
      return;
    }
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
          },
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

      {selectedImage ? (
        <div className="grid h-[241px] grid-cols-[241px_73px] gap-3">
          <button
            type="button"
            className="overflow-hidden rounded-md bg-[#f0f0f0] text-left"
            onClick={() =>
              openPicker(
                !iconUrl || selectedImage.kind === "icon" ? "icon" : "gallery",
              )
            }
            aria-label="Изменить выбранное изображение"
          >
            <img
              src={selectedImage.url}
              alt="Изображение награды"
              className="size-full object-cover"
            />
          </button>
          <div className="flex min-h-0 flex-col gap-[11px] overflow-y-auto">
            {images.map((item) => (
              <div
                key={item.key}
                className={`group relative aspect-square shrink-0 overflow-hidden rounded-md bg-[#f0f0f0] ${
                  item.key === selectedImage.key
                    ? "border-2 border-[#2563eb]"
                    : "border border-transparent"
                }`}
              >
                <button
                  type="button"
                  className="size-full"
                  onClick={() => setSelectedImageKey(item.key)}
                  aria-label="Показать изображение"
                >
                  <img src={item.url} alt="" className="size-full object-cover" />
                </button>
                {item.removable ? (
                  <button
                    type="button"
                    className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-black/45 text-white"
                    onClick={() =>
                      removeImage(item.kind, item.photo, item.fileIndex)
                    }
                    aria-label="Удалить изображение"
                  >
                    <X className="size-3" strokeWidth={2} />
                  </button>
                ) : null}
              </div>
            ))}
            {images.length < maxImages ? (
              <button
                type="button"
                className="flex aspect-square shrink-0 items-center justify-center rounded-md border-2 border-dashed border-[#2563eb] text-[#797979] hover:bg-[#f7f9ff]"
                onClick={() => openPicker(iconUrl ? "gallery" : "icon")}
                aria-label="Добавить изображения"
              >
                <span className="relative">
                  <Plus className="size-6" strokeWidth={1.5} />
                  <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#21c55d] text-white">
                    <Plus className="size-3" strokeWidth={2} />
                  </span>
                </span>
              </button>
            ) : null}
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

function RewardsPreview({
  roomId,
  roomSlug,
  onExit,
}: {
  roomId: string;
  roomSlug: string;
  onExit: () => void;
}) {
  const [rankRules, setRankRules] = useState<DraftRankRule[]>([]);
  const [proportional, setProportional] =
    useState<DraftProportionalReward>({
      amount: "",
      rankTo: "",
      minPoints: "",
      rewards: [],
    });
  const [manualRewards, setManualRewards] = useState<DraftManualReward[]>([]);

  return (
    <div className="flex min-h-dvh min-w-0 flex-col bg-white">
      <div className="flex min-h-12 items-start gap-2 bg-[#fff4e8] px-4 py-2 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
        <TriangleAlert className="size-4 shrink-0 text-[#f97316]" strokeWidth={1.5} />
        <p className="min-w-0 flex-1 break-words">
          Вы находитесь в режиме превью, где можно посмотреть, как награды будут распределяться в режиме спринта/конкурса. Чтобы применить награды, необходимо создать спринт/конкурс
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
      <SprintCreationStepTwo
        roomId={roomId}
        roomSlug={roomSlug}
        rankRules={rankRules}
        proportional={proportional}
        manualRewards={manualRewards}
        onRankRulesChange={setRankRules}
        onProportionalChange={setProportional}
        onManualRewardsChange={setManualRewards}
        onBack={() => undefined}
        onContinue={() => undefined}
        onSaveDraft={() => undefined}
        showWizardControls={false}
      />
    </div>
  );
}

export default function RewardsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading: isRoomLoading, isError: isRoomError, error: roomError } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";
  const { rewards, isLoading, isError, error, refetch } = useRoomRewards(roomId, {
    page: 1,
    size: 100,
    includeDeleted: false,
  }, { allPages: true });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editing, setEditing] = useState<BaseRewardDto | null>(null);
  const [form, setForm] = useState<RewardFormState>(emptyForm);
  const [updatedRewardId, setUpdatedRewardId] = useState("");
  const [pendingUsageTargets, setPendingUsageTargets] = useState<
    RewardUsageTarget[]
  >([]);
  const [selectedUsageTargets, setSelectedUsageTargets] = useState<Set<string>>(
    new Set(),
  );

  const rewardUsage = useRewardUsageTargets(
    roomId,
    editing?.id ?? "",
    dialogOpen && Boolean(editing),
  );
  const rewardVersionApply = useApplyRewardVersions(roomId);

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
      description: reward.description ?? "",
      iconFile: null,
      existingIconUrl: reward.iconUrl,
      deleteExistingIcon: false,
      existingPhotos: reward.photos,
      photoFiles: [],
      removedPhotoIds: [],
      isDivisible: reward.isDivisible,
      divisionPrecision: reward.divisionPrecision || 1,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (isPending || !roomId || !form.name.trim()) return;
    const divisionPrecision = form.isDivisible ? form.divisionPrecision : 0;
    const description = form.description.trim() || null;
    const onPhotoConfirmed = (file: File, reward: BaseRewardDto) => setForm((previous) => ({
      ...previous,
      photoFiles: previous.photoFiles.filter((pending) => pending !== file),
      existingPhotos: reward.photos.filter((photo) => !previous.removedPhotoIds.includes(photo.id)),
    }));

    if (editing) {
      updateReward(
        {
          id: editing.id,
          data: {
            name: form.name.trim(),
            description,
            isDivisible: form.isDivisible,
            divisionPrecision,
          },
          iconFile: form.iconFile,
          deleteExistingIcon: form.deleteExistingIcon,
          photoFiles: form.photoFiles,
          photoIdsToDelete: form.removedPhotoIds,
          onPhotoConfirmed,
        },
        {
          onSuccess: async (reward) => {
            const usageResult = await rewardUsage.refetch();
            const targets = usageResult.data ?? [];
            setUpdatedRewardId(reward.id);
            setPendingUsageTargets(targets);
            setSelectedUsageTargets(
              new Set(targets.map((target) => usageTargetKey(target))),
            );
            setDialogOpen(false);
            if (targets.length > 0) setApplyDialogOpen(true);
            else toast.success("Награда обновлена");
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
        description,
        roomId,
        iconFile: form.iconFile,
        photoFiles: form.photoFiles,
        photoIdsToDelete: form.removedPhotoIds,
        onPhotoConfirmed,
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

  const finishVersionApply = (message: string) => {
    setApplyDialogOpen(false);
    setUpdatedRewardId("");
    setPendingUsageTargets([]);
    setSelectedUsageTargets(new Set());
    toast.success(message);
  };

  const handleApplyVersions = () => {
    const targets = pendingUsageTargets.filter((target) =>
      selectedUsageTargets.has(usageTargetKey(target)),
    );
    if (!updatedRewardId || targets.length === 0) return;
    rewardVersionApply.applyRewardVersions(
      { rewardId: updatedRewardId, targets },
      { onSuccess: () => finishVersionApply("Изменения применены") },
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

  if (isRoomError || !room) {
    return <Alert variant="destructive"><AlertDescription>{roomError?.message || "Компания не найдена"}</AlertDescription></Alert>;
  }

  return (
    <div className="-m-4 min-h-dvh w-[calc(100%+2rem)] min-w-0 bg-white md:-m-6 md:w-[calc(100%+3rem)]">
      {previewOpen ? (
        <RewardsPreview
          roomId={roomId}
          roomSlug={slug ?? ""}
          onExit={() => setPreviewOpen(false)}
        />
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
            <Empty className="min-h-0 flex-1 gap-4 border-0 p-6 md:p-12">
              <EmptyHeader className="max-w-[320px] gap-1">
                <EmptyTitle className="text-[15px] font-medium leading-5 tracking-[-0.135px] text-black">
                  Награды еще не добавлены
                </EmptyTitle>
                <EmptyDescription className="text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#797979] no-underline">
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
                const imageUrl = reward.iconUrl ?? reward.photos[0]?.url;
                return (
                  <div
                    key={reward.id}
                    className="flex h-16 min-w-0 items-center gap-1.5 border-b border-[#e4e4e4] px-4 py-2"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e4e4e4] bg-[#f0f0f0]">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="size-10 object-cover" />
                      ) : (
                        <Gift className="size-6 text-[#797979]" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium leading-4 tracking-[-0.25px] text-black">
                        {reward.name}
                      </p>
                      <p className="mt-1 truncate text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#797979]">
                        {precisionLabel(reward)}
                      </p>
                    </div>
                    {!reward.isSystem ? (
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

      <DialogRoot open={dialogOpen} onOpenChange={(open) => { if (!isPending) setDialogOpen(open); }}>
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
              disabled={isPending}
              aria-label="Закрыть"
            >
              <X className="size-5" strokeWidth={1.5} />
            </Button>
          </DialogHeader>

          <fieldset disabled={isPending} className="m-0 min-h-0 min-w-0 flex-1 space-y-3 overflow-y-auto border-0 px-4 pb-4 pt-0">
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
              <label className="block text-[13px] font-medium leading-4 tracking-[-0.25px] text-[#797979]">
                Описание
              </label>
              <Textarea
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                className="h-[72px] min-h-[72px] resize-none border-[#e4e4e4] text-[13px] shadow-none"
                aria-label="Описание награды"
              />
              {validationErrors.description?.[0] ? (
                <p className="text-xs text-destructive">
                  {validationErrors.description[0]}
                </p>
              ) : null}
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
                <div className="space-y-1 pt-1">
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

            {editing && rewardUsage.isError ? (
              <Alert variant="destructive">
                <AlertDescription className="space-y-2">
                  <p>Не удалось проверить, где используется награда.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 bg-white"
                    onClick={() => void rewardUsage.refetch()}
                  >
                    Повторить
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}
          </fieldset>

          <DialogFooter className="h-12 shrink-0 flex-row items-center justify-end gap-2 px-4 py-2.5 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-7 border-[#e4e4e4] bg-white px-2 text-[13px] font-medium shadow-none"
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button
              type="button"
              className="h-7 bg-[#2563eb] px-2 text-[13px] font-medium hover:bg-[#2563eb]/90"
              onClick={handleSubmit}
              disabled={
                isPending ||
                !form.name.trim() ||
                (!editing && !form.iconFile) ||
                Boolean(editing && (rewardUsage.isLoading || rewardUsage.isError))
              }
            >
              {isCreating || isUpdating ? "Сохранение…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={applyDialogOpen}
        onOpenChange={(open) => {
          if (!open && !rewardVersionApply.isPending) {
            finishVersionApply("Награда обновлена");
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="w-[min(358px,calc(100vw-2rem))] gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 sm:max-w-[358px]"
        >
          <DialogHeader className="h-11 shrink-0 flex-row items-center gap-4 space-y-0 px-4 py-2.5">
            <DialogTitle className="flex-1 text-left text-[15px] font-medium leading-5 tracking-[-0.9px] text-black">
              Применить изменения
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon_sm"
              className="size-6 text-[#797979]"
              onClick={() => finishVersionApply("Награда обновлена")}
              disabled={rewardVersionApply.isPending}
              aria-label="Закрыть"
            >
              <X className="size-5" strokeWidth={1.5} />
            </Button>
          </DialogHeader>

          <div className="space-y-3 px-4 pb-2 pt-2">
            <p className="text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#797979]">
              Хотите применить изменения для текущих и запланированных событий?
            </p>
            <div className="space-y-2">
              {pendingUsageTargets.map((target) => {
                const key = usageTargetKey(target);
                return (
                  <div key={key} className="flex h-4 min-w-0 items-center gap-2.5">
                    <CheckBox
                      checked={selectedUsageTargets.has(key)}
                      onCheckedChange={(checked) =>
                        setSelectedUsageTargets((previous) => {
                          const next = new Set(previous);
                          if (checked === true) next.add(key);
                          else next.delete(key);
                          return next;
                        })
                      }
                      aria-label={`Применить изменения: ${target.name}`}
                      disabled={rewardVersionApply.isPending}
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
                      {target.name}
                    </span>
                    <span className="shrink-0 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#797979]">
                      {target.kind === "sprint" ? "Спринт" : "Событие"}
                    </span>
                  </div>
                );
              })}
            </div>
            {rewardVersionApply.generalError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {rewardVersionApply.generalError}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

          <DialogFooter className="h-12 shrink-0 flex-row items-center justify-end gap-2 px-4 py-2.5 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-7 border-[#e4e4e4] bg-white px-2 text-[13px] font-medium shadow-none"
              onClick={() => finishVersionApply("Награда обновлена")}
              disabled={rewardVersionApply.isPending}
            >
              Не применять
            </Button>
            <Button
              type="button"
              className="h-7 bg-[#2563eb] px-2 text-[13px] font-medium hover:bg-[#2563eb]/90"
              onClick={handleApplyVersions}
              disabled={rewardVersionApply.isPending || selectedUsageTargets.size === 0}
            >
              {rewardVersionApply.isPending ? "Применение…" : "Применить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
