import type { Dispatch, SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Button,
  InputField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@senler/ui";
import {
  ORD_CREATIVE_FLAG_OPTIONS,
  ORD_CREATIVE_FORM_OPTIONS,
  requiresOrdProductInfo,
  type OrdCreativeFormState,
} from "../ordCreative.utils";
import { OrdKktuPicker } from "./OrdKktuPicker";
import { OrdRoomFilesPicker } from "./OrdRoomFilesPicker";

const TEXTAREA_CLASS =
  "min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

interface OrdCreativeFormFieldsProps {
  form: OrdCreativeFormState;
  setForm: Dispatch<SetStateAction<OrdCreativeFormState>>;
  roomId: string;
  roomSlug: string;
  disabled?: boolean;
  fieldErrors?: Record<string, string>;
}

export function OrdCreativeFormFields({
  form,
  setForm,
  roomId,
  roomSlug,
  disabled = false,
  fieldErrors = {},
}: OrdCreativeFormFieldsProps) {
  const showProductFields = requiresOrdProductInfo(form.ordKktus);

  const toggleFlag = (value: (typeof ORD_CREATIVE_FLAG_OPTIONS)[number]["value"]) => {
    setForm((prev) => ({
      ...prev,
      ordFlags: prev.ordFlags.includes(value)
        ? prev.ordFlags.filter((flag) => flag !== value)
        : [...prev.ordFlags, value],
    }));
  };

  const updateDefaultText = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.defaultTexts];
      next[index] = value;
      return { ...prev, defaultTexts: next };
    });
  };

  const addDefaultText = () => {
    setForm((prev) => ({ ...prev, defaultTexts: [...prev.defaultTexts, ""] }));
  };

  const removeDefaultText = (index: number) => {
    setForm((prev) => ({
      ...prev,
      defaultTexts: prev.defaultTexts.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Тип креатива</h2>
          <p className="text-sm text-muted-foreground">
            Форма распространения и особые признаки рекламного объявления для ОРД.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Форма распространения</p>
          <Select
            value={form.ordForm || undefined}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                ordForm: value as OrdCreativeFormState["ordForm"],
              }))
            }
            disabled={disabled}
          >
            <SelectTrigger aria-label="Форма распространения">
              <SelectValue placeholder="Выберите тип креатива" />
            </SelectTrigger>
            <SelectContent>
              {ORD_CREATIVE_FORM_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Вид рекламы</p>
          <div className="space-y-2 rounded-md border border-border p-3">
            {ORD_CREATIVE_FLAG_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="border-input text-primary focus-visible:ring-ring size-4 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  checked={form.ordFlags.includes(option.value)}
                  disabled={disabled}
                  onChange={() => toggleFlag(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">ККТУ и товар</h2>
          <p className="text-sm text-muted-foreground">
            Классификатор категорий товаров и услуг для маркировки рекламы.
          </p>
        </div>

        <OrdKktuPicker
          selectedCodes={form.ordKktus}
          onChange={(ordKktus) => setForm((prev) => ({ ...prev, ordKktus }))}
          disabled={disabled}
          error={fieldErrors.ordKktus}
        />

        {showProductFields ? (
          <div className="space-y-4 rounded-md border border-border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">
              Для кода {form.ordKktus[0]} нужно указать сведения о товаре или услуге.
            </p>
            <InputBlock
              label="Бренд *"
              value={form.ordBrand}
              onChange={(value) => setForm((prev) => ({ ...prev, ordBrand: value }))}
              disabled={disabled}
              error={fieldErrors.ordBrand}
            />
            <InputBlock
              label="Вид товаров или услуг *"
              value={form.ordCategory}
              onChange={(value) => setForm((prev) => ({ ...prev, ordCategory: value }))}
              disabled={disabled}
              error={fieldErrors.ordCategory}
            />
            <TextareaBlock
              label="Описание товаров или услуг *"
              value={form.ordProductDescription}
              onChange={(value) => setForm((prev) => ({ ...prev, ordProductDescription: value }))}
              disabled={disabled}
              error={fieldErrors.ordProductDescription}
            />
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Аудитория</h2>
          <p className="text-sm text-muted-foreground">Описание целевой аудитории для ОРД.</p>
        </div>
        <TextareaBlock
          label="Целевая аудитория"
          value={form.ordTargeting}
          onChange={(value) => setForm((prev) => ({ ...prev, ordTargeting: value }))}
          disabled={disabled}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Контент креатива</h2>
          <p className="text-sm text-muted-foreground">
            Настройте, что амбассадор может менять сам, и какие дефолтные материалы использовать.
          </p>
        </div>

        <SwitchRow
          label="Амбассадор может прикреплять свои медиафайлы"
          checked={form.allowAmbassadorMedia}
          onCheckedChange={(allowAmbassadorMedia) =>
            setForm((prev) => ({ ...prev, allowAmbassadorMedia }))
          }
          disabled={disabled}
        />

        {!form.allowAmbassadorMedia ? (
          <OrdRoomFilesPicker
            roomId={roomId}
            roomSlug={roomSlug}
            selectedIds={form.defaultMediaIds}
            onChange={(defaultMediaIds) => setForm((prev) => ({ ...prev, defaultMediaIds }))}
            disabled={disabled}
            error={fieldErrors.defaultMediaIds}
          />
        ) : null}

        <SwitchRow
          label="Амбассадор может использовать свои тексты"
          checked={form.allowAmbassadorText}
          onCheckedChange={(allowAmbassadorText) =>
            setForm((prev) => ({ ...prev, allowAmbassadorText }))
          }
          disabled={disabled}
        />

        {!form.allowAmbassadorText ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Дефолтные тексты</p>
            {form.defaultTexts.map((text, index) => (
              <div key={index} className="flex gap-2">
                <textarea
                  className={TEXTAREA_CLASS}
                  value={text}
                  onChange={(event) => updateDefaultText(index, event.target.value)}
                  disabled={disabled}
                  rows={2}
                  aria-label={`Дефолтный текст ${index + 1}`}
                />
                {form.defaultTexts.length > 1 && !disabled ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label="Удалить текст"
                    onClick={() => removeDefaultText(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            ))}
            {!disabled ? (
              <Button type="button" variant="outline" size="sm" onClick={addDefaultText}>
                <Plus className="mr-1 size-4" />
                Добавить текст
              </Button>
            ) : null}
            {fieldErrors.defaultTexts ? (
              <p className="text-sm text-destructive">{fieldErrors.defaultTexts}</p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function InputBlock({
  label,
  value,
  onChange,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <InputField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        error={!!error}
        helperText={error}
        aria-label={label}
      />
    </div>
  );
}

function TextareaBlock({
  label,
  value,
  onChange,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <textarea
        className={TEXTAREA_CLASS}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={3}
        aria-label={label}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function SwitchRow({
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </label>
  );
}
