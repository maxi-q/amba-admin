import { useMemo, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
  getOrdContractTemplatesControllerGetTemplateByIdQueryKey,
  getOrdContractTemplatesControllerGetTemplatesQueryKey,
  ordContractTemplatesControllerGetTemplateById,
  useOrdContractTemplatesControllerAttachCreativeTask,
  useOrdContractTemplatesControllerAttachEvent,
  useOrdContractTemplatesControllerAttachRoom,
  useOrdContractTemplatesControllerDetachCreativeTask,
  useOrdContractTemplatesControllerDetachEvent,
  useOrdContractTemplatesControllerDetachRoom,
  useOrdContractTemplatesControllerGetTemplates,
} from "@/api/generated/ord-contract-templates/ord-contract-templates";
import type { OrdContractTemplateItemDto, OrdContractTemplateWithLinksDto } from "@/api/generated/model";
import { ApiError } from "@/types";

export type OrdTemplateLinkEntityType = "room" | "event" | "creativeTask";

export type OrdTemplateLinkItem = OrdContractTemplateItemDto & {
  linked: boolean;
  isDetailLoaded: boolean;
};

interface UseOrdTemplateLinksParams {
  roomId: string;
  entityId: string;
  entityType: OrdTemplateLinkEntityType;
  enabled?: boolean;
}

const isTemplateLinked = (
  template: OrdContractTemplateWithLinksDto | undefined,
  entityType: OrdTemplateLinkEntityType,
  entityId: string
) => {
  if (!template) return false;
  if (entityType === "room") return (template.roomLinks ?? []).some((link) => link.roomId === entityId);
  if (entityType === "event") return (template.eventLinks ?? []).some((link) => link.eventId === entityId);

  return (template.creativeTaskLinks ?? []).some((link) => link.creativeTaskId === entityId);
};

export function useOrdTemplateLinks({
  roomId,
  entityId,
  entityType,
  enabled = true,
}: UseOrdTemplateLinksParams) {
  const queryClient = useQueryClient();
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const queryEnabled = enabled && !!roomId && !!entityId;
  const templatesQuery = useOrdContractTemplatesControllerGetTemplates(
    roomId,
    { page: 1, size: 100 },
    { query: { enabled: queryEnabled } }
  );
  const attachRoom = useOrdContractTemplatesControllerAttachRoom();
  const detachRoom = useOrdContractTemplatesControllerDetachRoom();
  const attachEvent = useOrdContractTemplatesControllerAttachEvent();
  const detachEvent = useOrdContractTemplatesControllerDetachEvent();
  const attachCreativeTask = useOrdContractTemplatesControllerAttachCreativeTask();
  const detachCreativeTask = useOrdContractTemplatesControllerDetachCreativeTask();
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
          .filter((entry): entry is [string, OrdContractTemplateWithLinksDto] => !!entry[0] && !!entry[1])
      ),
    [detailsQueries, rawTemplates]
  );
  const templates: OrdTemplateLinkItem[] = useMemo(
    () =>
      rawTemplates.map((template) => {
        const detail = templateDetails.get(template.id);

        return {
          ...template,
          linked: isTemplateLinked(detail, entityType, entityId),
          isDetailLoaded: !!detail,
        };
      }),
    [entityId, entityType, rawTemplates, templateDetails]
  );
  const isDetailsLoading = detailsQueries.some((query) => query.isLoading);
  const detailsError = detailsQueries.find((query) => query.isError)?.error;
  const mutationError =
    attachRoom.error ??
    detachRoom.error ??
    attachEvent.error ??
    detachEvent.error ??
    attachCreativeTask.error ??
    detachCreativeTask.error ??
    null;
  const isPending =
    attachRoom.isPending ||
    detachRoom.isPending ||
    attachEvent.isPending ||
    detachEvent.isPending ||
    attachCreativeTask.isPending ||
    detachCreativeTask.isPending;
  const error = templatesQuery.error ?? detailsError ?? mutationError ?? null;
  const isValidationError = mutationError instanceof ApiError && mutationError.statusCode === 422;
  const validationErrors =
    mutationError instanceof ApiError && mutationError.fieldErrors ? mutationError.fieldErrors : {};
  const generalError =
    mutationError instanceof ApiError && mutationError.statusCode !== 422 ? mutationError.message : "";

  const invalidateTemplate = (templateId: string) => {
    queryClient.invalidateQueries({
      queryKey: getOrdContractTemplatesControllerGetTemplatesQueryKey(roomId),
    });
    queryClient.invalidateQueries({
      queryKey: getOrdContractTemplatesControllerGetTemplateByIdQueryKey(roomId, templateId),
    });
  };

  const createMutationOptions = (templateId: string) => ({
    onSuccess: () => invalidateTemplate(templateId),
    onSettled: () => setPendingTemplateId(null),
  });

  const mutate = (templateId: string, linked: boolean) => {
    if (!queryEnabled || isPending) return;

    setPendingTemplateId(templateId);

    if (entityType === "room") {
      if (linked) {
        detachRoom.mutate({ roomId, templateId, targetRoomId: entityId }, createMutationOptions(templateId));
      } else {
        attachRoom.mutate({ roomId, templateId, targetRoomId: entityId }, createMutationOptions(templateId));
      }
      return;
    }

    if (entityType === "event") {
      if (linked) {
        detachEvent.mutate({ roomId, templateId, eventId: entityId }, createMutationOptions(templateId));
      } else {
        attachEvent.mutate({ roomId, templateId, eventId: entityId }, createMutationOptions(templateId));
      }
      return;
    }

    if (linked) {
      detachCreativeTask.mutate({ roomId, templateId, creativeTaskId: entityId }, createMutationOptions(templateId));
    } else {
      attachCreativeTask.mutate({ roomId, templateId, creativeTaskId: entityId }, createMutationOptions(templateId));
    }
  };

  return {
    templates,
    isLoading: templatesQuery.isLoading || isDetailsLoading,
    isError: templatesQuery.isError || !!detailsError || !!mutationError,
    error,
    queryError: templatesQuery.error ?? detailsError ?? null,
    mutationError,
    isPending,
    pendingTemplateId,
    mutate,
    isValidationError,
    validationErrors,
    generalError,
  };
}
