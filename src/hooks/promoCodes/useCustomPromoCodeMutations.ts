import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCustomPromoCode,
  updateCustomPromoCode,
  type CreateCustomPromoCodeRequestDto,
  type UpdateCustomPromoCodeRequestDto,
} from '@/api/custom-promo-codes';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { ApiError } from '@/types';

const getErrorState = (error: unknown) => ({
  validationErrors: error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {},
  generalError:
    error instanceof ApiError && error.statusCode !== 422
      ? error.message
      : error instanceof Error && !(error instanceof ApiError && error.statusCode === 422)
        ? error.message
        : '',
});

export function useCreateCustomPromoCode() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.CREATE_CUSTOM_PROMO_CODE],
    mutationFn: (data: CreateCustomPromoCodeRequestDto) => createCustomPromoCode(data),
    onSuccess: (promoCode) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CUSTOM_PROMO_CODES, promoCode.roomId],
      });
    },
  });

  return {
    createPromoCode: mutation.mutate,
    isPending: mutation.isPending,
    ...getErrorState(mutation.error),
  };
}

export function useUpdateCustomPromoCode(roomId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.UPDATE_CUSTOM_PROMO_CODE],
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomPromoCodeRequestDto }) =>
      updateCustomPromoCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CUSTOM_PROMO_CODES, roomId],
      });
    },
  });

  return {
    updatePromoCode: mutation.mutate,
    isPending: mutation.isPending,
    ...getErrorState(mutation.error),
  };
}
