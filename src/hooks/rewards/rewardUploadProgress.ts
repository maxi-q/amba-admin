import type { CreateRewardPhotoResponseDto, RewardImageUploadDto } from "../../api/generated/model";

type UploadProgress = { upload: RewardImageUploadDto; uploaded: boolean; confirmed: boolean };

export interface RewardUploadProgress {
  rewardId?: string;
  icon?: UploadProgress & { file: File };
  photos: WeakMap<File, UploadProgress & { photoId: string }>;
  deletedPhotoIds: Set<string>;
}

export const newRewardUploadProgress = (): RewardUploadProgress => ({
  photos: new WeakMap(),
  deletedPhotoIds: new Set(),
});

export async function uploadRewardImages<T extends { photos: { sortOrder: number }[] }>(
  reward: T,
  iconFile: File | null | undefined,
  photoFiles: File[],
  progress: RewardUploadProgress,
  actions: {
    createIconUpload: (file: File) => Promise<RewardImageUploadDto>;
    createPhoto: (file: File, sortOrder: number) => Promise<CreateRewardPhotoResponseDto>;
    upload: (file: File, upload: RewardImageUploadDto) => Promise<void>;
    confirmIcon: () => Promise<T>;
    confirmPhoto: (photoId: string) => Promise<T>;
    onPhotoConfirmed?: (file: File, reward: T) => void;
  }
): Promise<T> {
  let result = reward;
  if (iconFile) {
    if (progress.icon?.file !== iconFile) {
      progress.icon = { file: iconFile, upload: await actions.createIconUpload(iconFile), uploaded: false, confirmed: false };
    }
    const icon = progress.icon;
    if (!icon.uploaded) {
      await actions.upload(iconFile, icon.upload);
      icon.uploaded = true;
    }
    if (!icon.confirmed) {
      result = await actions.confirmIcon();
      icon.confirmed = true;
    }
  }

  const firstSortOrder = result.photos.reduce((highest, photo) => Math.max(highest, photo.sortOrder), -1) + 1;
  for (const [index, file] of photoFiles.entries()) {
    let photo = progress.photos.get(file);
    if (!photo) {
      const created = await actions.createPhoto(file, firstSortOrder + index);
      photo = { ...created, uploaded: false, confirmed: false };
      // Keep the server ID even if upload/confirmation subsequently fails.
      progress.photos.set(file, photo);
    }
    if (!photo.uploaded) {
      await actions.upload(file, photo.upload);
      photo.uploaded = true;
    }
    if (!photo.confirmed) {
      result = await actions.confirmPhoto(photo.photoId);
      photo.confirmed = true;
      actions.onPhotoConfirmed?.(file, result);
    }
  }
  return result;
}
