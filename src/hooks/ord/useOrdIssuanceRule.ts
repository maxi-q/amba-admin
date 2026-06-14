import { useQueryClient } from "@tanstack/react-query";
import {
  getOrdIssuanceRulesControllerGetRoomIssuanceRuleQueryKey,
  getOrdIssuanceRulesControllerGetTaskIssuanceRuleQueryKey,
  useOrdIssuanceRulesControllerGetRoomIssuanceRule,
  useOrdIssuanceRulesControllerGetTaskIssuanceRule,
  useOrdIssuanceRulesControllerUpsertRoomIssuanceRule,
  useOrdIssuanceRulesControllerUpsertTaskIssuanceRule,
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
      retry: (failureCount, error) => !isNotConfiguredError(error) && failureCount < 2,
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

export function useTaskOrdIssuanceRule({ roomId, taskId, enabled = true }: UseTaskOrdIssuanceRuleParams) {
  const query = useOrdIssuanceRulesControllerGetTaskIssuanceRule(roomId, taskId, {
    query: {
      enabled: enabled && !!roomId && !!taskId,
      retry: (failureCount, error) => !isNotConfiguredError(error) && failureCount < 2,
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
  const queryClient = useQueryClient();
  const mutation = useOrdIssuanceRulesControllerUpsertTaskIssuanceRule();
  const error = mutation.error ?? null;

  const mutate = (data: UpsertOrdIssuanceRuleDto, onSuccess?: () => void) => {
    if (!roomId || !taskId || mutation.isPending) return;

    mutation.mutate(
      { roomId, taskId, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getOrdIssuanceRulesControllerGetTaskIssuanceRuleQueryKey(roomId, taskId),
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
