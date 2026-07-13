import type {
  CreativeTaskWithDefaultsDto,
  UpdateCreativeTaskRequestDto,
  UpdateCreativeTaskRequestDtoOrdFlagsItem,
  UpdateCreativeTaskRequestDtoOrdForm,
  UpdateCreativeTaskRequestDtoOrdPayType,
} from "@/api/generated/model";

export const ORD_CREATIVE_KKTU_PRODUCT_CODE = "30.15.1";
export const ORD_CREATIVE_KKTU_MAX = 16;

export const ORD_CREATIVE_FORM_OPTIONS: {
  value: NonNullable<UpdateCreativeTaskRequestDtoOrdForm>;
  label: string;
}[] = [
  { value: "banner", label: "Баннер" },
  { value: "text_block", label: "Текстовый блок" },
  { value: "text_graphic_block", label: "Текстово-графический блок" },
  { value: "audio", label: "Аудио" },
  { value: "video", label: "Видео" },
  { value: "live_audio", label: "Прямой эфир (аудио)" },
  { value: "live_video", label: "Прямой эфир (видео)" },
  { value: "text_video_block", label: "Текстово-видео блок" },
  { value: "text_graphic_video_block", label: "Текстово-графический видео блок" },
  { value: "text_audio_block", label: "Текстово-аудио блок" },
  { value: "text_graphic_audio_block", label: "Текстово-графический аудио блок" },
  { value: "text_audio_video_block", label: "Текстово-аудио-видео блок" },
  { value: "text_graphic_audio_video_block", label: "Текстово-графический аудио-видео блок" },
  { value: "banner_html5", label: "HTML5-баннер" },
];

export const ORD_CREATIVE_FLAG_OPTIONS: {
  value: UpdateCreativeTaskRequestDtoOrdFlagsItem;
  label: string;
}[] = [
  { value: "social", label: "Социальная реклама" },
  { value: "social_quota", label: "Социальная реклама (квота)" },
];

export const ORD_CREATIVE_PAY_TYPE_OPTIONS: {
  value: NonNullable<UpdateCreativeTaskRequestDtoOrdPayType>;
  label: string;
}[] = [
  { value: "cpm", label: "CPM (за показы)" },
  { value: "cpc", label: "CPC (за клики)" },
  { value: "cpa", label: "CPA (за действия)" },
  { value: "other", label: "Иное" },
];

const ordFormLabelByValue = new Map(
  ORD_CREATIVE_FORM_OPTIONS.map((option) => [option.value, option.label])
);

const ordPayTypeLabelByValue = new Map(
  ORD_CREATIVE_PAY_TYPE_OPTIONS.map((option) => [option.value, option.label])
);

export type OrdCreativeFormState = {
  ordForm: UpdateCreativeTaskRequestDtoOrdForm | "";
  ordPayType: UpdateCreativeTaskRequestDtoOrdPayType | "";
  ordFlags: UpdateCreativeTaskRequestDtoOrdFlagsItem[];
  ordKktus: string[];
  ordBrand: string;
  ordCategory: string;
  ordProductDescription: string;
  ordTargeting: string;
  allowAmbassadorMedia: boolean;
  allowAmbassadorText: boolean;
  defaultMediaIds: string[];
  defaultTexts: string[];
};

export function taskToOrdCreativeForm(task: CreativeTaskWithDefaultsDto): OrdCreativeFormState {
  return {
    ordForm: task.ordForm ?? "",
    ordPayType: task.ordPayType ?? "",
    ordFlags: task.ordFlags?.filter((flag) => flag !== "native") ?? [],
    ordKktus: task.ordKktus ?? [],
    ordBrand: task.ordBrand ?? "",
    ordCategory: task.ordCategory ?? "",
    ordProductDescription: task.ordProductDescription ?? "",
    ordTargeting: task.ordTargeting ?? "",
    allowAmbassadorMedia: task.allowAmbassadorMedia,
    allowAmbassadorText: task.allowAmbassadorText,
    defaultMediaIds: task.defaultMediaIds ?? [],
    defaultTexts: task.defaultTexts?.length ? [...task.defaultTexts] : [""],
  };
}

export function ordCreativeFormToPayload(form: OrdCreativeFormState): UpdateCreativeTaskRequestDto {
  const defaultTexts = form.defaultTexts.map((text) => text.trim()).filter(Boolean);

  return {
    ordForm: form.ordForm || null,
    ordPayType: form.ordPayType || null,
    ordFlags: form.ordFlags.length ? form.ordFlags : [],
    ordKktus: form.ordKktus,
    ordBrand: form.ordBrand.trim() || null,
    ordCategory: form.ordCategory.trim() || null,
    ordProductDescription: form.ordProductDescription.trim() || null,
    ordTargeting: form.ordTargeting.trim() || null,
    allowAmbassadorMedia: form.allowAmbassadorMedia,
    allowAmbassadorText: form.allowAmbassadorText,
    defaultMediaIds: form.defaultMediaIds,
    defaultTexts,
  };
}

export function requiresOrdProductInfo(kktus: string[]): boolean {
  return kktus.length === 1 && kktus[0] === ORD_CREATIVE_KKTU_PRODUCT_CODE;
}

export function validateOrdCreativeForm(form: OrdCreativeFormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.ordPayType) {
    errors.ordPayType = "Укажите тип оплаты креатива.";
  }

  if (!form.allowAmbassadorMedia && form.defaultMediaIds.length === 0) {
    errors.defaultMediaIds = "Выберите хотя бы один ORD-файл комнаты или разрешите медиа амбассадора.";
  }

  const texts = form.defaultTexts.map((text) => text.trim()).filter(Boolean);
  if (!form.allowAmbassadorText && texts.length === 0) {
    errors.defaultTexts = "Добавьте хотя бы один дефолтный текст или разрешите тексты амбассадора.";
  }

  if (requiresOrdProductInfo(form.ordKktus)) {
    if (!form.ordBrand.trim()) errors.ordBrand = "Укажите бренд товаров или услуг.";
    if (!form.ordCategory.trim()) errors.ordCategory = "Укажите вид товаров или услуг.";
    if (!form.ordProductDescription.trim()) {
      errors.ordProductDescription = "Укажите описание товаров или услуг.";
    }
  }

  if (form.ordKktus.length > ORD_CREATIVE_KKTU_MAX) {
    errors.ordKktus = `Можно выбрать не более ${ORD_CREATIVE_KKTU_MAX} кодов ККТУ.`;
  }

  return errors;
}

export function getOrdFormLabel(value: UpdateCreativeTaskRequestDtoOrdForm | null | undefined): string {
  if (!value) return "Не задан";
  return ordFormLabelByValue.get(value) ?? value;
}

export function getOrdPayTypeLabel(
  value: UpdateCreativeTaskRequestDtoOrdPayType | null | undefined
): string {
  if (!value) return "Не задан";
  return ordPayTypeLabelByValue.get(value) ?? value;
}

export function getOrdCreativeSummaryLines(task: CreativeTaskWithDefaultsDto): string[] {
  const lines: string[] = [];
  lines.push(`Тип креатива: ${getOrdFormLabel(task.ordForm)}`);
  lines.push(`Тип оплаты: ${getOrdPayTypeLabel(task.ordPayType)}`);

  const kktuCount = task.ordKktus?.length ?? 0;
  lines.push(kktuCount ? `ККТУ: ${kktuCount} ${kktuCount === 1 ? "код" : "кода"}` : "ККТУ: не выбраны");

  lines.push(
    task.allowAmbassadorMedia
      ? "Медиа: амбассадор может прикреплять свои"
      : `Медиа: только дефолтные (${task.defaultMediaIds?.length ?? 0})`
  );
  lines.push(
    task.allowAmbassadorText
      ? "Тексты: амбассадор может использовать свои"
      : `Тексты: только дефолтные (${task.defaultTexts?.length ?? 0})`
  );

  return lines;
}
