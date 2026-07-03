import { useQueryClient } from "@tanstack/react-query";
import {
  getOrdIssuanceRulesControllerGetRoomIssuanceRuleQueryKey,
  useOrdIssuanceRulesControllerGetRoomIssuanceRule,
  useOrdIssuanceRulesControllerUpsertRoomIssuanceRule,
} from "@/api/generated/ord-issuance-rules/ord-issuance-rules";
import type { UpsertOrdIssuanceRuleDto } from "@/api/generated/model";
import { ApiError } from "@/types";

const getMutationErrorState = (error: unknown) => ({
  isValidationError: error instanceof ApiError && error.statusCode === 422,
  validationErrors: error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {},
  generalError: error instanceof ApiError && error.statusCode !== 422 ? error.message : "",
});

const isNotConfiguredError = (error: unknown) =>
  error instanceof ApiError && error.statusCode === 404;

interface UseRoomOrdIssuanceRuleParams {
  roomId: string;
  enabled?: boolean;
}

interface UseTaskOrdIssuanceRuleParams {
  roomId: string;
  taskId: string;
  enabled?: boolean;
}

export function useRoomOrdIssuanceRule({ roomId, enabled = true }: UseRoomOrdIssuanceRuleParams) {
  const query = useOrdIssuanceRulesControllerGetRoomIssuanceRule(roomId, {
    query: {
      enabled: enabled && !!roomId,
      retry: (failureCount: number, error: unknown) => !isNotConfiguredError(error) && failureCount < 2,
    },
  });

  const isNotConfigured = isNotConfiguredError(query.error);

  return {
    rule: isNotConfigured ? null : (query.data ?? null),
    isLoading: query.isLoading,
    isError: query.isError && !isNotConfigured,
    error: isNotConfigured ? null : query.error,
    isNotConfigured,
    refetch: query.refetch,
  };
}

export function useTaskOrdIssuanceRule(...args: [UseTaskOrdIssuanceRuleParams]) {
  void args;

  return {
    rule: null,
    isLoading: false,
    isError: false,
    error: null,
    isNotConfigured: true,
    refetch: async () => ({}) as never,
  };
}

export function useUpsertRoomOrdIssuanceRule(roomId: string) {
  const queryClient = useQueryClient();
  const mutation = useOrdIssuanceRulesControllerUpsertRoomIssuanceRule();
  const error = mutation.error ?? null;

  const mutate = (data: UpsertOrdIssuanceRuleDto, onSuccess?: () => void) => {
    if (!roomId || mutation.isPending) return;

    mutation.mutate(
      { roomId, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getOrdIssuanceRulesControllerGetRoomIssuanceRuleQueryKey(roomId),
          });
          onSuccess?.();
        },
      }
    );
  };

  return {
    mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error,
    reset: mutation.reset,
    ...getMutationErrorState(error),
  };
}

export function useUpsertTaskOrdIssuanceRule(roomId: string, taskId: string) {
  const mutate = (...args: [UpsertOrdIssuanceRuleDto, (() => void)?]) => {
    void args;

    if (!roomId || !taskId) return;
  };

  return {
    mutate,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: () => undefined,
    isValidationError: false,
    validationErrors: {},
    generalError: "Автовыпуск ORD-договоров для задачи больше не поддерживается API.",
  };
}
