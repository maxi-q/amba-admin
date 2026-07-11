/** Локальный черновик аватара компании до появления API на бэкенде. */
export type CompanyAvatarDraft = {
  file: File | null;
  previewUrl: string | null;
};

export const EMPTY_COMPANY_AVATAR_DRAFT: CompanyAvatarDraft = {
  file: null,
  previewUrl: null,
};

/**
 * Заготовка для будущей отправки аватара на бэкенд.
 * Сейчас не вызывается из create-flow — только хранит File для последующего wiring.
 */
export function getCompanyAvatarUploadFile(
  draft: CompanyAvatarDraft
): File | null {
  return draft.file;
}

/**
 * Заготовка для FormData / multipart, когда API будет готов.
 */
export function buildCompanyAvatarFormData(
  draft: CompanyAvatarDraft,
  fieldName = "avatar"
): FormData | null {
  if (!draft.file) return null;

  const formData = new FormData();
  formData.append(fieldName, draft.file);
  return formData;
}
