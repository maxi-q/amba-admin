import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { MutationKeys } from "@/config/tanstack/mutationKeys";
import {
  rewardsControllerConfirmIconUpload,
  rewardsControllerCreateIconUploadUrl,
  rewardsControllerCreateReward,
  rewardsControllerDeleteReward,
  rewardsControllerUpdateReward,
} from "@/api/generated/rewards/rewards";
import type {
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
}

export interface UpdateRewardInput {
  id: string;
  data: UpdateRewardRequestDto;
  iconFile?: File | null;
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
    mutationFn: async ({ name, roomId, iconFile }: CreateRewardInput) => {
      const contentType = getContentType(iconFile);
      const reward = await rewardsControllerCreateReward({
        name,
        roomId,
        contentType,
      });

      try {
        await uploadImage(iconFile, reward.iconUpload);
        return await rewardsControllerConfirmIconUpload(reward.id);
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
    ...getErrorState(mutation.error),
  };
}

export function useUpdateReward() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.UPDATE_REWARD],
    mutationFn: async ({ id, data, iconFile }: UpdateRewardInput) => {
      const reward = await rewardsControllerUpdateReward(id, data);
      if (!iconFile) return reward;

      const contentType = getContentType(iconFile);
      const upload = await rewardsControllerCreateIconUploadUrl(id, {
        contentType: contentType as RewardImageUploadRequestDto["contentType"],
      });
      await uploadImage(iconFile, upload);
      return rewardsControllerConfirmIconUpload(id);
    },
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REWARDS, reward.roomId], exact: false });
    },
  });

  return {
    updateReward: mutation.mutate,
    isPending: mutation.isPending,
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
