import { useQueryClient } from "@tanstack/react-query";
import {
  getOrdFileTemplatesControllerGetTemplatesQueryKey,
  ordFileTemplatesControllerConfirmUpload,
  ordFileTemplatesControllerCreateTemplate,
  ordFileTemplatesControllerCreateUploadUrl,
  ordFileTemplatesControllerDeleteTemplate,
  ordFileTemplatesControllerGetDownloadUrl,
  useOrdFileTemplatesControllerGetTemplates,
} from "@/api/generated/ord-file-templates/ord-file-templates";
import type { OrdFileTemplatesControllerGetTemplatesParams } from "@/api/generated/model";
import { uploadOrdFileToPresignedUrl } from "@/utils/ordFileUpload";

interface UseOrdRoomFileTemplatesParams {
  roomId: string;
  params?: OrdFileTemplatesControllerGetTemplatesParams;
  enabled?: boolean;
}

export function useOrdRoomFileTemplates({
  roomId,
  params = { page: 1, size: 20 },
  enabled = true,
}: UseOrdRoomFileTemplatesParams) {
  const query = useOrdFileTemplatesControllerGetTemplates(roomId, params, {
    query: {
      enabled: enabled && !!roomId,
      refetchInterval: (queryState) => {
        const items = queryState.state.data?.items ?? [];
        return items.some((item) => item.status === "pending") ? 5000 : false;
      },
    },
  });

  return {
    files: query.data?.items ?? [],
    pagination: query.data
      ? {
          page: query.data.page,
          size: query.data.size,
          total: query.data.total,
          totalPages: query.data.totalPages,
        }
      : null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useOrdRoomFileTemplateActions(roomId: string) {
  const queryClient = useQueryClient();

  const invalidateList = () => {
    queryClient.invalidateQueries({
      queryKey: getOrdFileTemplatesControllerGetTemplatesQueryKey(roomId),
    });
  };

  const createAndUpload = async (title: string, file: File) => {
    const created = await ordFileTemplatesControllerCreateTemplate(roomId, { title });
    const contentType = file.type || undefined;
    const uploadUrl = await ordFileTemplatesControllerCreateUploadUrl(roomId, created.id, {
      contentType,
    });

    await uploadOrdFileToPresignedUrl(file, uploadUrl, contentType);
    await ordFileTemplatesControllerConfirmUpload(roomId, created.id);

    invalidateList();
    return created.id;
  };

  const uploadBody = async (fileId: string, file: File) => {
    const contentType = file.type || undefined;
    const uploadUrl = await ordFileTemplatesControllerCreateUploadUrl(roomId, fileId, {
      contentType,
    });

    await uploadOrdFileToPresignedUrl(file, uploadUrl, contentType);
    await ordFileTemplatesControllerConfirmUpload(roomId, fileId);

    invalidateList();
  };

  const download = async (fileId: string) => {
    const response = await ordFileTemplatesControllerGetDownloadUrl(roomId, fileId);
    window.open(response.url, "_blank", "noopener,noreferrer");
  };

  const remove = async (fileId: string) => {
    await ordFileTemplatesControllerDeleteTemplate(roomId, fileId);
    invalidateList();
  };

  return {
    createAndUpload,
    uploadBody,
    download,
    remove,
    invalidateList,
  };
}
