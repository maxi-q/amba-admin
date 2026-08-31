import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
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
  RewardImageUploadDto,
  RewardImageUploadRequestDto,
  UpdateRewardRequestDto,
} from "@/api/generated/model";
import { ApiError } from "@/types";

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
  isDivisible: boolean;
  divisionPrecision: number;
}

export interface UpdateRewardInput {
  id: string;
  data: UpdateRewardRequestDto;
  iconFile?: File | null;
  photoFiles?: File[];
  photoIdsToDelete?: string[];
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

export function useCreateReward() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.CREATE_REWARD],
    mutationFn: async ({
      name,
      roomId,
      iconFile,
      photoFiles = [],
      isDivisible,
      divisionPrecision,
    }: CreateRewardInput) => {
      const contentType = getContentType(iconFile);
      const reward = await rewardsControllerCreateReward({
        name,
        roomId,
        contentType,
        isDivisible,
        divisionPrecision,
      });

      try {
        await uploadImage(iconFile, reward.iconUpload);
        let result = await rewardsControllerConfirmIconUpload(reward.id);
        for (const [sortOrder, file] of photoFiles.entries()) {
          const photo = await rewardsControllerCreatePhoto(reward.id, {
            contentType: getContentType(file) as CreateRewardPhotoRequestDto["contentType"],
            sortOrder,
          });
          await uploadImage(file, photo.upload);
          result = await rewardsControllerConfirmPhotoUpload(reward.id, photo.photoId);
        }
        return result;
      } catch (error) {
        await rewardsControllerDeleteReward(reward.id).catch(() => undefined);
        throw error;
      }
    },
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REWARDS, reward.roomId], exact: false });
    },
  });

  return {
    createReward: mutation.mutate,
    isPending: mutation.isPending,
    resetCreateReward: mutation.reset,
    ...getErrorState(mutation.error),
  };
}

export function useUpdateReward() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.UPDATE_REWARD],
    mutationFn: async ({
      id,
      data,
      iconFile,
      photoFiles = [],
      photoIdsToDelete = [],
    }: UpdateRewardInput) => {
      const iconContentType = iconFile ? getContentType(iconFile) : null;
      const photoContentTypes = photoFiles.map(
        (file) => getContentType(file) as CreateRewardPhotoRequestDto["contentType"]
      );
      let reward = await rewardsControllerUpdateReward(id, data);

      if (iconFile && iconContentType) {
        const upload = await rewardsControllerCreateIconUploadUrl(id, {
          contentType: iconContentType as RewardImageUploadRequestDto["contentType"],
        });
        await uploadImage(iconFile, upload);
        reward = await rewardsControllerConfirmIconUpload(id);
      }

      const firstNewSortOrder =
        reward.photos.reduce(
          (highest, photo) => Math.max(highest, photo.sortOrder),
          -1
        ) + 1;

      for (const [sortOrder, file] of photoFiles.entries()) {
        const photo = await rewardsControllerCreatePhoto(id, {
          contentType: photoContentTypes[sortOrder],
          sortOrder: firstNewSortOrder + sortOrder,
        });
        try {
          await uploadImage(file, photo.upload);
          reward = await rewardsControllerConfirmPhotoUpload(id, photo.photoId);
        } catch (error) {
          await rewardsControllerDeletePhoto(id, photo.photoId).catch(() => undefined);
          throw error;
        }
      }

      for (const photoId of photoIdsToDelete) {
        await rewardsControllerDeletePhoto(id, photoId);
      }

      return reward;
    },
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REWARDS, reward.roomId], exact: false });
    },
  });

  return {
    updateReward: mutation.mutate,
    isPending: mutation.isPending,
    resetUpdateReward: mutation.reset,
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
