import { useMemo, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  getOrdContractTemplatesControllerGetTemplateByIdQueryKey,
  getOrdContractTemplatesControllerGetTemplatesQueryKey,
  ordContractTemplatesControllerGetTemplateById,
  useOrdContractTemplatesControllerCreateIssuanceRule,
  useOrdContractTemplatesControllerDeactivateIssuanceRule,
  useOrdContractTemplatesControllerGetTemplates,
} from "@/api/generated/ord-contract-templates/ord-contract-templates";
import type { OrdContractTemplateItemDto, OrdContractTemplateWithRulesDto } from "@/api/generated/model";
import { ApiError } from "@/types";

export type OrdTemplateLinkEntityType = "room" | "event" | "creativeTask";

export type OrdTemplateLinkItem = OrdContractTemplateItemDto & {
  linked: boolean;
  isDetailLoaded: boolean;
  ruleId: string | null;
};

interface UseOrdTemplateLinksParams {
  roomId: string;
  entityId: string;
  entityType: OrdTemplateLinkEntityType;
  enabled?: boolean;
}

type UseCreateOrdTemplateLinkParams = UseOrdTemplateLinksParams;

interface UseDeactivateOrdTemplateLinkParams {
  roomId: string;
  enabled?: boolean;
}

interface DeactivateOrdTemplateLinkVariables {
  templateId: string;
  ruleId: string;
}

const TEMPLATE_LINKS_PAGE = { page: 1, size: 100 };

const getActiveRuleId = (
  template: OrdContractTemplateWithRulesDto | undefined,
  entityType: OrdTemplateLinkEntityType,
  entityId: string
) => {
  const rule = (template?.issuanceRules ?? []).find(
    (item) => item.isActive && item.sourceType === entityType && item.sourceId === entityId
  );

  return rule?.id ?? null;
};

const invalidateTemplate = (queryClient: QueryClient, roomId: string, templateId: string) => {
  queryClient.invalidateQueries({
    queryKey: getOrdContractTemplatesControllerGetTemplatesQueryKey(roomId),
  });
  queryClient.invalidateQueries({
    queryKey: getOrdContractTemplatesControllerGetTemplateByIdQueryKey(roomId, templateId),
  });
};

const getMutationErrorState = (error: unknown) => ({
  isValidationError: error instanceof ApiError && error.statusCode === 422,
  validationErrors: error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {},
  generalError: error instanceof ApiError && error.statusCode !== 422 ? error.message : "",
});

export function useOrdTemplateLinks({
  roomId,
  entityId,
  entityType,
  enabled = true,
}: UseOrdTemplateLinksParams) {
  const queryEnabled = enabled && !!roomId && !!entityId;
  const templatesQuery = useOrdContractTemplatesControllerGetTemplates(
    roomId,
    TEMPLATE_LINKS_PAGE,
    { query: { enabled: queryEnabled } }
  );
  const rawTemplates = templatesQuery.data?.items ?? [];
  const detailsQueries = useQueries({
    queries: rawTemplates.map((template) => ({
      queryKey: getOrdContractTemplatesControllerGetTemplateByIdQueryKey(roomId, template.id),
      queryFn: () => ordContractTemplatesControllerGetTemplateById(roomId, template.id),
      enabled: queryEnabled,
      staleTime: 30 * 1000,
    })),
  });
  const templateDetails = useMemo(
    () =>
      new Map(
        detailsQueries
          .map((query, index) => [rawTemplates[index]?.id, query.data] as const)
          .filter((entry): entry is [string, OrdContractTemplateWithRulesDto] => !!entry[0] && !!entry[1])
      ),
    [detailsQueries, rawTemplates]
  );
  const templates: OrdTemplateLinkItem[] = useMemo(
    () =>
      rawTemplates.map((template) => {
        const detail = templateDetails.get(template.id);
        const ruleId = getActiveRuleId(detail, entityType, entityId);

        return {
          ...template,
          linked: !!ruleId,
          isDetailLoaded: !!detail,
          ruleId,
        };
      }),
    [entityId, entityType, rawTemplates, templateDetails]
  );
  const isDetailsLoading = detailsQueries.some((query) => query.isLoading);
  const detailsError = detailsQueries.find((query) => query.isError)?.error;
  const error = templatesQuery.error ?? detailsError ?? null;

  return {
    templates,
    isLoading: templatesQuery.isLoading || isDetailsLoading,
    isError: templatesQuery.isError || !!detailsError,
    error,
    queryError: templatesQuery.error ?? detailsError ?? null,
  };
}

export function useCreateOrdTemplateLink({
  roomId,
  entityId,
  entityType,
  enabled = true,
}: UseCreateOrdTemplateLinkParams) {
  const queryClient = useQueryClient();
  const createIssuanceRule = useOrdContractTemplatesControllerCreateIssuanceRule();
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const error = createIssuanceRule.error ?? null;
  const errorState = getMutationErrorState(error);

  const mutate = (templateId: string) => {
    if (!enabled || !roomId || !entityId || createIssuanceRule.isPending) return;

    setPendingTemplateId(templateId);
    createIssuanceRule.mutate(
      {
        roomId,
        templateId,
        data: {
          sourceType: entityType,
          sourceId: entityId,
        },
      },
      {
        onSuccess: () => invalidateTemplate(queryClient, roomId, templateId),
        onSettled: () => setPendingTemplateId(null),
      }
    );
  };

  return {
    mutate,
    isPending: createIssuanceRule.isPending,
    pendingTemplateId,
    error,
    isSuccess: createIssuanceRule.isSuccess,
    isError: createIssuanceRule.isError,
    ...errorState,
  };
}

export function useDeactivateOrdTemplateLink({
  roomId,
  enabled = true,
}: UseDeactivateOrdTemplateLinkParams) {
  const queryClient = useQueryClient();
  const deactivateIssuanceRule = useOrdContractTemplatesControllerDeactivateIssuanceRule();
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const error = deactivateIssuanceRule.error ?? null;
  const errorState = getMutationErrorState(error);

  const mutate = ({ templateId, ruleId }: DeactivateOrdTemplateLinkVariables) => {
    if (!enabled || !roomId || deactivateIssuanceRule.isPending) return;

    setPendingTemplateId(templateId);
    deactivateIssuanceRule.mutate(
      { roomId, templateId, ruleId },
      {
        onSuccess: () => invalidateTemplate(queryClient, roomId, templateId),
        onSettled: () => setPendingTemplateId(null),
      }
    );
  };

  return {
    mutate,
    isPending: deactivateIssuanceRule.isPending,
    pendingTemplateId,
    error,
    isSuccess: deactivateIssuanceRule.isSuccess,
    isError: deactivateIssuanceRule.isError,
    ...errorState,
  };
}
