import { useQueryClient } from "@tanstack/react-query";
import {
  getOrdContractTemplatesControllerGetIssuanceRulesQueryKey,
  getOrdContractTemplatesControllerGetTemplateByIdQueryKey,
  getOrdContractTemplatesControllerGetTemplatesQueryKey,
  useOrdContractTemplatesControllerCreateIssuanceRule,
  useOrdContractTemplatesControllerDeactivateIssuanceRule,
  useOrdContractTemplatesControllerGetIssuanceRules,
  useOrdContractTemplatesControllerGetTemplates,
} from "@/api/generated/ord-contract-templates/ord-contract-templates";
import type {
  CreateOrdContractIssuanceRuleRequestDto,
  OrdContractTemplatesControllerGetTemplatesParams,
} from "@/api/generated/model";
import { ApiError } from "@/types";

interface UseOrdTemplatesParams {
  roomId: string;
  params?: OrdContractTemplatesControllerGetTemplatesParams;
  enabled?: boolean;
}

interface UseOrdTemplateRulesParams {
  roomId: string;
  templateId: string;
  enabled?: boolean;
}

interface UseCreateOrdTemplateRuleParams {
  roomId: string;
  templateId: string;
  enabled?: boolean;
}

type UseDeactivateOrdTemplateRuleParams = UseCreateOrdTemplateRuleParams;

const getMutationErrorState = (error: unknown) => ({
  isValidationError: error instanceof ApiError && error.statusCode === 422,
  validationErrors: error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {},
  generalError: error instanceof ApiError && error.statusCode !== 422 ? error.message : "",
});

export function useOrdTemplates({ roomId, params = { page: 1, size: 100 }, enabled = true }: UseOrdTemplatesParams) {
  const templatesQuery = useOrdContractTemplatesControllerGetTemplates(
    roomId,
    params,
    { query: { enabled: enabled && !!roomId } }
  );

  return {
    templates: templatesQuery.data?.items ?? [],
    pagination: templatesQuery.data
      ? {
          page: templatesQuery.data.page,
          size: templatesQuery.data.size,
          total: templatesQuery.data.total,
          totalPages: templatesQuery.data.totalPages,
        }
      : null,
    isLoading: templatesQuery.isLoading,
    isError: templatesQuery.isError,
    error: templatesQuery.error,
  };
}

export function useOrdTemplateRules({ roomId, templateId, enabled = true }: UseOrdTemplateRulesParams) {
  const rulesQuery = useOrdContractTemplatesControllerGetIssuanceRules(
    roomId,
    templateId,
    { query: { enabled: enabled && !!roomId && !!templateId } }
  );

  return {
    rules: rulesQuery.data ?? [],
    isLoading: rulesQuery.isLoading,
    isError: rulesQuery.isError,
    error: rulesQuery.error,
  };
}

export function useCreateOrdTemplateRule({ roomId, templateId, enabled = true }: UseCreateOrdTemplateRuleParams) {
  const queryClient = useQueryClient();
  const createRule = useOrdContractTemplatesControllerCreateIssuanceRule();
  const error = createRule.error ?? null;
  const errorState = getMutationErrorState(error);

  const mutate = (data: CreateOrdContractIssuanceRuleRequestDto) => {
    if (!enabled || !roomId || !templateId || createRule.isPending) return;

    createRule.mutate(
      { roomId, templateId, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getOrdContractTemplatesControllerGetIssuanceRulesQueryKey(roomId, templateId),
          });
          queryClient.invalidateQueries({
            queryKey: getOrdContractTemplatesControllerGetTemplateByIdQueryKey(roomId, templateId),
          });
          queryClient.invalidateQueries({
            queryKey: getOrdContractTemplatesControllerGetTemplatesQueryKey(roomId),
          });
        },
      }
    );
  };

  return {
    mutate,
    isPending: createRule.isPending,
    error,
    isSuccess: createRule.isSuccess,
    isError: createRule.isError,
    reset: createRule.reset,
    ...errorState,
  };
}

export function useDeactivateOrdTemplateRule({
  roomId,
  templateId,
  enabled = true,
}: UseDeactivateOrdTemplateRuleParams) {
  const queryClient = useQueryClient();
  const deactivateRule = useOrdContractTemplatesControllerDeactivateIssuanceRule();
  const error = deactivateRule.error ?? null;
  const errorState = getMutationErrorState(error);

  const mutate = (ruleId: string) => {
    if (!enabled || !roomId || !templateId || !ruleId || deactivateRule.isPending) return;

    deactivateRule.mutate(
      { roomId, templateId, ruleId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getOrdContractTemplatesControllerGetIssuanceRulesQueryKey(roomId, templateId),
          });
          queryClient.invalidateQueries({
            queryKey: getOrdContractTemplatesControllerGetTemplateByIdQueryKey(roomId, templateId),
          });
          queryClient.invalidateQueries({
            queryKey: getOrdContractTemplatesControllerGetTemplatesQueryKey(roomId),
          });
        },
      }
    );
  };

  return {
    mutate,
    isPending: deactivateRule.isPending,
    error,
    isSuccess: deactivateRule.isSuccess,
    isError: deactivateRule.isError,
    reset: deactivateRule.reset,
    ...errorState,
  };
}
