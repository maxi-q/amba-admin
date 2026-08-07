import { useEffect, useState } from "react";
import { HelpCircle, Plus, X } from "lucide-react";
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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@senler/ui";
import { OrdContractTemplateSelect } from "../../../ord/components/OrdContractTemplateSelect";
import { OrdKktuPicker } from "../../../creativetasks/components/OrdKktuPicker";
import { OrdRoomFilesPicker } from "../../../creativetasks/components/OrdRoomFilesPicker";
import type { CreativeTaskFormat } from "../../../creativetasks/utils/creativetaskUtils";
import {
  cloneDraftSprintTask,
  emptyDraftSprintTask,
  PLATFORM_OPTIONS,
  type DraftSprintTask,
} from "./draftSprintTask";

interface SprintCreationTaskDialogProps {
  open: boolean;
  roomId: string;
  roomSlug: string;
  initialTask?: DraftSprintTask | null;
  onClose: () => void;
  onSave: (task: DraftSprintTask) => void;
}

const FORMAT_CHIPS: { value: CreativeTaskFormat; label: string }[] = [
  { value: "POST", label: "Пост" },
  { value: "VIDEO", label: "Видео" },
];

function FieldRow({
  label,
  hint,
  children,
  alignTop = false,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  alignTop?: boolean;
}) {
  return (
    <div
      className={[
        "grid gap-3 border-b border-[#e4e4e4] p-4 md:grid-cols-[248px_minmax(0,1fr)]",
        alignTop ? "md:items-start" : "md:items-center",
      ].join(" ")}
    >
      <div className="space-y-1">
        <p className="text-[13px] font-medium leading-4 text-foreground">{label}</p>
        {hint ? (
          <p className="text-[13px] font-medium leading-4 text-[#797979]">{hint}</p>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function RequestFromPerformer({
  checked,
  onCheckedChange,
  title,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  title: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium leading-4 text-foreground">
      <CheckBox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        aria-label={title}
      />
      <span className="inline-flex items-center gap-1" title={title}>
        Запросить у исполнителя
        <HelpCircle className="size-4 text-[#797979]" aria-hidden />
      </span>
    </label>
  );
}

export function SprintCreationTaskDialog({
  open,
  roomId,
  roomSlug,
  initialTask,
  onClose,
  onSave,
}: SprintCreationTaskDialogProps) {
  const [form, setForm] = useState<DraftSprintTask>(emptyDraftSprintTask);
  const [clientError, setClientError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(initialTask ? cloneDraftSprintTask(initialTask) : emptyDraftSprintTask());
    setClientError("");
  }, [initialTask, open]);

  const toggleFormat = (format: CreativeTaskFormat) => {
    setForm((prev) => {
      const exists = prev.allowedFormats.includes(format);
      if (exists && prev.allowedFormats.length === 1) return prev;
      return {
        ...prev,
        allowedFormats: exists
          ? prev.allowedFormats.filter((item) => item !== format)
          : [...prev.allowedFormats, format],
      };
    });
  };

  const handleSave = () => {
    if (!form.title.trim() || form.title.trim().length < 3) {
      setClientError("Укажите название задания (минимум 3 символа)");
      return;
    }
    if (!form.ordContractTemplateId) {
      setClientError("Выберите шаблон ОРД-договора");
      return;
    }
    if (form.allowedFormats.length === 0) {
      setClientError("Выберите хотя бы один формат публикации");
      return;
    }
    if (!form.allowAmbassadorTargetUrl && form.targetUrls.every((url) => !url.trim())) {
      setClientError("Добавьте целевую ссылку или запросите её у исполнителя");
      return;
    }
    if (!form.allowAmbassadorText && form.defaultTexts.every((text) => !text.trim())) {
      setClientError("Добавьте текст или запросите его у исполнителя");
      return;
    }
    if (!form.allowAmbassadorMedia && form.defaultMediaIds.length === 0) {
      setClientError("Выберите файлы или запросите их у исполнителя");
      return;
    }
    setClientError("");
    onSave(form);
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90dvh] w-[min(700px,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[700px]"
      >
        <DialogHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-[#e4e4e4] px-4 py-3">
          <DialogTitle className="flex-1 text-left text-[15px] font-medium leading-5">
            {initialTask ? "Изменить задание" : "Добавить задание"}
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X className="size-5" />
          </Button>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {clientError ? (
            <div className="px-4 pt-4">
              <Alert variant="destructive">
                <AlertDescription>{clientError}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          <FieldRow label="Код ККТУ" hint="Выберите тематику публикации" alignTop>
            <OrdKktuPicker
              selectedCodes={form.ordKktus}
              onChange={(ordKktus) => setForm((prev) => ({ ...prev, ordKktus }))}
            />
          </FieldRow>

          <FieldRow label="Шаблон ОРД-договора" hint="Обязателен для создания задания" alignTop>
            <OrdContractTemplateSelect
              roomId={roomId}
              roomSlug={roomSlug}
              value={form.ordContractTemplateId}
              onChange={(ordContractTemplateId) =>
                setForm((prev) => ({ ...prev, ordContractTemplateId }))
              }
              required
            />
          </FieldRow>

          <FieldRow label="Название">
            <Input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="h-10 border-[#e4e4e4] bg-white text-[13px] shadow-none"
              aria-label="Название задания"
            />
          </FieldRow>

          <FieldRow label="Что нужно сделать" hint="Опишите суть задания" alignTop>
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className="min-h-[72px] border-[#e4e4e4] bg-white text-[13px] shadow-none"
              aria-label="Что нужно сделать"
            />
          </FieldRow>

          <FieldRow label="Целевая ссылка для перехода" alignTop>
            <div className="space-y-3">
              {form.targetUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={url}
                    onChange={(event) =>
                      setForm((prev) => {
                        const targetUrls = [...prev.targetUrls];
                        targetUrls[index] = event.target.value;
                        return { ...prev, targetUrls };
                      })
                    }
                    placeholder="https://"
                    className="h-10 flex-1 border-[#e4e4e4] bg-white text-[13px] shadow-none"
                    aria-label={`Целевая ссылка ${index + 1}`}
                  />
                  {form.targetUrls.length > 1 ? (
                    <button
                      type="button"
                      className="text-[#797979] hover:text-foreground"
                      aria-label="Удалить ссылку"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          targetUrls: prev.targetUrls.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      <X className="size-4" />
                    </button>
                  ) : null}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 border-[#e4e4e4] bg-white px-2 text-[13px] shadow-none"
                onClick={() =>
                  setForm((prev) => ({ ...prev, targetUrls: [...prev.targetUrls, ""] }))
                }
              >
                <Plus className="size-4" aria-hidden />
                Добавить
              </Button>
              <RequestFromPerformer
                checked={form.allowAmbassadorTargetUrl}
                onCheckedChange={(allowAmbassadorTargetUrl) =>
                  setForm((prev) => ({ ...prev, allowAmbassadorTargetUrl }))
                }
                title="Исполнитель укажет свою ссылку перехода"
              />
            </div>
          </FieldRow>

          <FieldRow label="Формат публикации" alignTop>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {FORMAT_CHIPS.map((chip) => {
                  const active = form.allowedFormats.includes(chip.value);
                  return (
                    <button
                      key={chip.value}
                      type="button"
                      onClick={() => toggleFormat(chip.value)}
                      className={[
                        "h-7 rounded-md px-2 text-[13px] font-medium leading-4",
                        active
                          ? "bg-[#2563eb] text-white"
                          : "border border-[#e4e4e4] bg-white text-foreground",
                      ].join(" ")}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-2">
                <p className="text-[13px] font-medium leading-4 text-foreground">Где разместить</p>
                <Select
                  value={form.targetPlatform}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      targetPlatform: value as DraftSprintTask["targetPlatform"],
                    }))
                  }
                >
                  <SelectTrigger className="h-10 border-[#e4e4e4] bg-white text-[13px] shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FieldRow>

          <FieldRow label="Медиаматериалы" alignTop>
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[13px] font-medium leading-4">Файлы</p>
                <OrdRoomFilesPicker
                  roomId={roomId}
                  roomSlug={roomSlug}
                  selectedIds={form.defaultMediaIds}
                  onChange={(defaultMediaIds) =>
                    setForm((prev) => ({ ...prev, defaultMediaIds }))
                  }
                />
                <RequestFromPerformer
                  checked={form.allowAmbassadorMedia}
                  onCheckedChange={(allowAmbassadorMedia) =>
                    setForm((prev) => ({ ...prev, allowAmbassadorMedia }))
                  }
                  title="Исполнитель приложит свои файлы"
                />
              </div>

              <div className="space-y-3">
                <p className="text-[13px] font-medium leading-4">Текст</p>
                {form.defaultTexts.map((text, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Textarea
                      value={text}
                      onChange={(event) =>
                        setForm((prev) => {
                          const defaultTexts = [...prev.defaultTexts];
                          defaultTexts[index] = event.target.value;
                          return { ...prev, defaultTexts };
                        })
                      }
                      className="min-h-[72px] flex-1 border-[#e4e4e4] bg-white text-[13px] shadow-none"
                      aria-label={`Текст ${index + 1}`}
                    />
                    {form.defaultTexts.length > 1 ? (
                      <button
                        type="button"
                        className="mt-1 text-[#797979] hover:text-foreground"
                        aria-label="Удалить текст"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            defaultTexts: prev.defaultTexts.filter(
                              (_, itemIndex) => itemIndex !== index
                            ),
                          }))
                        }
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 border-[#e4e4e4] bg-white px-2 text-[13px] shadow-none"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      defaultTexts: [...prev.defaultTexts, ""],
                    }))
                  }
                >
                  <Plus className="size-4" aria-hidden />
                  Добавить
                </Button>
                <RequestFromPerformer
                  checked={form.allowAmbassadorText}
                  onCheckedChange={(allowAmbassadorText) =>
                    setForm((prev) => ({ ...prev, allowAmbassadorText }))
                  }
                  title="Исполнитель напишет свой текст"
                />
              </div>
            </div>
          </FieldRow>

          <FieldRow
            label="Что запрещено"
            hint="Расскажите, что нельзя делать в рамках задания, мы дополнительно отметим этот пункт"
            alignTop
          >
            <Textarea
              value={form.prohibited}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, prohibited: event.target.value }))
              }
              className="min-h-[72px] border-[#e4e4e4] bg-white text-[13px] shadow-none"
              aria-label="Что запрещено"
            />
          </FieldRow>

          <FieldRow
            label="Критерии оценки"
            hint="Укажите требования к заданию, которые необходимо соблюдать"
            alignTop
          >
            <div className="space-y-3">
              {form.criteria.map((criterion, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={criterion}
                    onChange={(event) =>
                      setForm((prev) => {
                        const criteria = [...prev.criteria];
                        criteria[index] = event.target.value;
                        return { ...prev, criteria };
                      })
                    }
                    placeholder={`${index + 1}.`}
                    className="h-10 flex-1 border-[#e4e4e4] bg-white text-[13px] shadow-none"
                    aria-label={`Критерий ${index + 1}`}
                  />
                  {form.criteria.length > 1 ? (
                    <button
                      type="button"
                      className="text-[#797979] hover:text-foreground"
                      aria-label="Удалить критерий"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          criteria: prev.criteria.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      <X className="size-4" />
                    </button>
                  ) : null}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 border-[#e4e4e4] bg-white px-2 text-[13px] shadow-none"
                onClick={() =>
                  setForm((prev) => ({ ...prev, criteria: [...prev.criteria, ""] }))
                }
              >
                <Plus className="size-4" aria-hidden />
                Добавить
              </Button>
            </div>
          </FieldRow>

          <FieldRow
            label="Модерация"
            hint="Установите, на каких этапах вы будете оценивать работу"
            alignTop
          >
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 text-[13px] font-medium leading-4">
                <Switch
                  checked={form.requireMaterialsReview}
                  onCheckedChange={(requireMaterialsReview) =>
                    setForm((prev) => ({ ...prev, requireMaterialsReview }))
                  }
                  aria-label="Перед публикацией"
                />
                <span
                  className="inline-flex items-center gap-1"
                  title="Проверка материалов до выхода публикации"
                >
                  Перед публикацией
                  <HelpCircle className="size-4 text-[#797979]" aria-hidden />
                </span>
              </label>
              <label className="flex items-center gap-2.5 text-[13px] font-medium leading-4">
                <Switch
                  checked={form.requirePublicationReview}
                  onCheckedChange={(requirePublicationReview) =>
                    setForm((prev) => ({ ...prev, requirePublicationReview }))
                  }
                  aria-label="После публикации"
                />
                <span
                  className="inline-flex items-center gap-1"
                  title="Проверка уже опубликованного контента"
                >
                  После публикации
                  <HelpCircle className="size-4 text-[#797979]" aria-hidden />
                </span>
              </label>
            </div>
          </FieldRow>

          <FieldRow
            label="Очки"
            hint="Укажите минимальный порог очков (XP), которое вы начислите за выполнение"
            alignTop
          >
            <div className="space-y-2">
              <p className="text-[13px] font-medium leading-4 text-foreground">От</p>
              <Input
                type="number"
                min={0}
                value={form.minimalRewardInBalls}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    minimalRewardInBalls: event.target.value,
                  }))
                }
                className="h-10 border-[#e4e4e4] bg-white text-[13px] shadow-none"
                aria-label="Минимальные очки"
              />
            </div>
          </FieldRow>
        </div>

        <DialogFooter className="shrink-0 border-t border-[#e4e4e4] px-4 py-2.5 sm:justify-end">
          <Button
            type="button"
            size="sm"
            className="h-7 bg-[#2563eb] px-2 text-[13px] font-medium hover:bg-[#2563eb]/90"
            onClick={handleSave}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
