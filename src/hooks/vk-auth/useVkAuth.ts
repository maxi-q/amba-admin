import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getVkAuthControllerGetStatusQueryKey,
  vkAuthControllerGetAuthorizationUrl,
  vkAuthControllerGetStatus,
} from "@/api/generated/vk-auth/vk-auth";

export function useVkAuth() {
  const statusQuery = useQuery({
    queryKey: getVkAuthControllerGetStatusQueryKey(),
    queryFn: () => vkAuthControllerGetStatus(),
    refetchOnWindowFocus: true,
  });
  const authorizationMutation = useMutation({
    mutationFn: () => vkAuthControllerGetAuthorizationUrl(),
  });

  return {
    status: statusQuery.data,
    isLoading: statusQuery.isLoading,
    isError: statusQuery.isError || authorizationMutation.isError,
    error: statusQuery.error ?? authorizationMutation.error,
    refetch: statusQuery.refetch,
    getAuthorizationUrl: authorizationMutation.mutateAsync,
    isConnecting: authorizationMutation.isPending,
  };
}
