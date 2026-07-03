import { QueryKeys } from '@/config/tanstack/queryKeys';
import { privateCreativeTasksControllerGetPrivateCreativeTaskById } from '@/api/generated/private-creative-tasks/private-creative-tasks';
import { useQuery } from '@tanstack/react-query';

export function usePrivateCreativeTask(id: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.PRIVATE_CREATIVE_TASK, id],
    queryFn: () => privateCreativeTasksControllerGetPrivateCreativeTaskById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    task: data ?? null,
  };
}
