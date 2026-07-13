import type {
  PrivateCreativeTaskWithDefaultsDto,
  UpdatePrivateCreativeTaskRequestDto,
  UpdatePrivateCreativeTaskRequestDtoOrdFlagsItem,
  UpdatePrivateCreativeTaskRequestDtoOrdForm,
} from "@/api/generated/model";
import {
  getOrdFormLabel,
  getOrdPayTypeLabel,
  type OrdCreativeFormState,
} from "./ordCreative.utils";

export function privateTaskToOrdCreativeForm(
  task: PrivateCreativeTaskWithDefaultsDto
): OrdCreativeFormState {
  return {
    ordForm: (task.ordForm ?? "") as OrdCreativeFormState["ordForm"],
    ordPayType: (task.ordPayType ?? "") as OrdCreativeFormState["ordPayType"],
    ordFlags: (task.ordFlags?.filter((flag) => flag !== "native") ??
      []) as OrdCreativeFormState["ordFlags"],
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

export function privateOrdCreativeFormToPayload(
  form: OrdCreativeFormState
): UpdatePrivateCreativeTaskRequestDto {
  const defaultTexts = form.defaultTexts.map((text) => text.trim()).filter(Boolean);

  return {
    ordForm: (form.ordForm || null) as UpdatePrivateCreativeTaskRequestDtoOrdForm | null,
    ordPayType: (form.ordPayType || null) as UpdatePrivateCreativeTaskRequestDto["ordPayType"],
    ordFlags: form.ordFlags.length
      ? (form.ordFlags as UpdatePrivateCreativeTaskRequestDtoOrdFlagsItem[])
      : [],
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

export function getPrivateOrdCreativeSummaryLines(
  task: PrivateCreativeTaskWithDefaultsDto
): string[] {
  const lines: string[] = [];
  lines.push(`Тип креатива: ${getOrdFormLabel(task.ordForm as Exclude<OrdCreativeFormState["ordForm"], ""> | undefined)}`);
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
