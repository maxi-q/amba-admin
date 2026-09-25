import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { MutationKeys } from "@/config/tanstack/mutationKeys";
import {
  rewardsControllerConfirmIconUpload,
  rewardsControllerConfirmPhotoUpload,
  rewardsControllerCreateIconUploadUrl,
  rewardsControllerCreatePhoto,
  rewardsControllerCreateReward,
  rewardsControllerDeletePhoto,
  rewardsControllerDeleteReward,
  rewardsControllerUpdateReward,
} from "@/api/generated/rewards/rewards";
import type {
  CreateRewardPhotoRequestDto,
  CreateRewardRequestDto,
  BaseRewardDto,
  RewardImageUploadDto,
  RewardImageUploadRequestDto,
  UpdateRewardRequestDto,
} from "@/api/generated/model";
import { ApiError } from "@/types";
import { newRewardUploadProgress, uploadRewardImages, type RewardUploadProgress } from "./rewardUploadProgress";

const getErrorState = (error: unknown) => ({
  isValidationError: error instanceof ApiError && error.statusCode === 422,
  validationErrors: error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {},
  generalError:
    error instanceof ApiError && error.statusCode !== 422
      ? error.message
      : error instanceof Error
        ? error.message
        : "",
});

export interface CreateRewardInput {
  name: string;
  roomId: string;
  iconFile: File;
  photoFiles?: File[];
  photoIdsToDelete?: string[];
  onPhotoConfirmed?: (file: File, reward: BaseRewardDto) => void;
  isDivisible: boolean;
  divisionPrecision: number;
}

export interface UpdateRewardInput {
  id: string;
  data: UpdateRewardRequestDto;
  iconFile?: File | null;
  photoFiles?: File[];
  photoIdsToDelete?: string[];
  onPhotoConfirmed?: (file: File, reward: BaseRewardDto) => void;
}

const supportedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const getContentType = (file: File) => {
  if (!supportedImageTypes.has(file.type)) {
    throw new Error("Поддерживаются изображения JPEG, PNG, WebP и GIF");
  }
  return file.type as CreateRewardRequestDto["contentType"];
};

const uploadImage = async (file: File, upload: RewardImageUploadDto) => {
  if (file.size > upload.maxBytes) {
    throw new Error(
      `Размер изображения не должен превышать ${Math.floor(upload.maxBytes / 1024 / 1024)} МБ`
    );
  }

  const response = await fetch(upload.url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить изображение награды");
  }
};

const rewardUploadActions = (id: string, onPhotoConfirmed?: (file: File, reward: BaseRewardDto) => void) => ({
  createIconUpload: (file: File) => rewardsControllerCreateIconUploadUrl(id, {
    contentType: getContentType(file) as RewardImageUploadRequestDto["contentType"],
  }),
  createPhoto: (file: File, sortOrder: number) => rewardsControllerCreatePhoto(id, {
    contentType: getContentType(file) as CreateRewardPhotoRequestDto["contentType"],
    sortOrder,
  }),
  upload: uploadImage,
  confirmIcon: () => rewardsControllerConfirmIconUpload(id),
  confirmPhoto: (photoId: string) => rewardsControllerConfirmPhotoUpload(id, photoId),
  onPhotoConfirmed,
});

async function deleteRequestedPhotos(id: string, photoIds: string[], progress: RewardUploadProgress) {
  for (const photoId of photoIds) {
    if (progress.deletedPhotoIds.has(photoId)) continue;
    await rewardsControllerDeletePhoto(id, photoId);
    progress.deletedPhotoIds.add(photoId);
  }
}

export function useCreateReward() {
  const queryClient = useQueryClient();
  const progress = useRef(newRewardUploadProgress());
  const mutation = useMutation({
    mutationKey: [MutationKeys.CREATE_REWARD],
    mutationFn: async ({
      name,
      roomId,
      iconFile,
      photoFiles = [],
      photoIdsToDelete = [],
      onPhotoConfirmed,
      isDivisible,
      divisionPrecision,
    }: CreateRewardInput) => {
      const contentType = getContentType(iconFile);
      photoFiles.forEach(getContentType);
      let reward: BaseRewardDto;
      if (progress.current.rewardId) {
        reward = await rewardsControllerUpdateReward(progress.current.rewardId, { name, isDivisible, divisionPrecision });
      } else {
        const created = await rewardsControllerCreateReward({ name, roomId, contentType, isDivisible, divisionPrecision });
        reward = created;
        progress.current.rewardId = created.id;
        progress.current.icon = { file: iconFile, upload: created.iconUpload, uploaded: false, confirmed: false };
      }
      const result = await uploadRewardImages(reward, iconFile, photoFiles, progress.current, rewardUploadActions(reward.id, onPhotoConfirmed));
      await deleteRequestedPhotos(reward.id, photoIdsToDelete, progress.current);
      return result;
    },
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REWARDS, reward.roomId], exact: false });
    },
    onError: (_error, input) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REWARDS, input.roomId], exact: false });
    },
  });
  const resetCreateReward = useCallback(() => {
    progress.current = newRewardUploadProgress();
    mutation.reset();
  }, [mutation.reset]);

  return {
    createReward: mutation.mutate,
    isPending: mutation.isPending,
    resetCreateReward,
    ...getErrorState(mutation.error),
  };
}

export function useUpdateReward() {
  const queryClient = useQueryClient();
  const progress = useRef(newRewardUploadProgress());
  const mutation = useMutation({
    mutationKey: [MutationKeys.UPDATE_REWARD],
    mutationFn: async ({
      id,
      data,
      iconFile,
      photoFiles = [],
      photoIdsToDelete = [],
      onPhotoConfirmed,
    }: UpdateRewardInput) => {
      if (progress.current.rewardId !== id) {
        progress.current = { ...newRewardUploadProgress(), rewardId: id };
      }
      if (iconFile) getContentType(iconFile);
      photoFiles.forEach(getContentType);
      const reward = await rewardsControllerUpdateReward(id, data);
      const result = await uploadRewardImages(reward, iconFile, photoFiles, progress.current, rewardUploadActions(id, onPhotoConfirmed));
      await deleteRequestedPhotos(id, photoIdsToDelete, progress.current);
      return result;
    },
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REWARDS, reward.roomId], exact: false });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REWARDS], exact: false });
    },
  });
  const resetUpdateReward = useCallback(() => {
    progress.current = newRewardUploadProgress();
    mutation.reset();
  }, [mutation.reset]);

  return {
    updateReward: mutation.mutate,
    isPending: mutation.isPending,
    resetUpdateReward,
    ...getErrorState(mutation.error),
  };
}

export function useDeleteReward(roomId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.DELETE_REWARD],
    mutationFn: (id: string) => rewardsControllerDeleteReward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REWARDS, roomId], exact: false });
    },
  });

  const generalError = useMemo(
    () =>
      mutation.error instanceof ApiError && mutation.error.statusCode !== 422
        ? mutation.error.message
        : "",
    [mutation.error]
  );

  return {
    deleteReward: mutation.mutate,
    isPending: mutation.isPending,
    generalError,
  };
}
