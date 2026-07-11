import { useCallback, useEffect, useState } from "react";
import {
  EMPTY_COMPANY_AVATAR_DRAFT,
  type CompanyAvatarDraft,
} from "@/pages/(list_integration)/rooms/types/companyAvatar";

const ACCEPTED_TYPES = ["image/png", "image/jpeg"] as const;
const MIN_SIZE_PX = 200;

function revokePreviewUrl(url: string | null) {
  if (url) URL.revokeObjectURL(url);
}

async function validateAvatarFile(
  file: File
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
    return { ok: false, message: "Допустимы только PNG или JPEG" };
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const image = new Image();
        image.onload = () =>
          resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error("Не удалось прочитать изображение"));
        image.src = objectUrl;
      }
    );

    if (dimensions.width < MIN_SIZE_PX || dimensions.height < MIN_SIZE_PX) {
      return {
        ok: false,
        message: `Минимальный размер — ${MIN_SIZE_PX}×${MIN_SIZE_PX} px`,
      };
    }

    return { ok: true };
  } catch {
    return { ok: false, message: "Не удалось прочитать изображение" };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function useCompanyAvatarDraft() {
  const [draft, setDraft] = useState<CompanyAvatarDraft>(EMPTY_COMPANY_AVATAR_DRAFT);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setDraft((current) => {
      revokePreviewUrl(current.previewUrl);
      return EMPTY_COMPANY_AVATAR_DRAFT;
    });
    setError(null);
  }, []);

  const setFile = useCallback(async (file: File | null) => {
    if (!file) {
      reset();
      return;
    }

    const validation = await validateAvatarFile(file);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    setDraft((current) => {
      revokePreviewUrl(current.previewUrl);
      return {
        file,
        previewUrl: URL.createObjectURL(file),
      };
    });
    setError(null);
  }, [reset]);

  useEffect(() => () => revokePreviewUrl(draft.previewUrl), [draft.previewUrl]);

  return {
    draft,
    error,
    setFile,
    reset,
  };
}
