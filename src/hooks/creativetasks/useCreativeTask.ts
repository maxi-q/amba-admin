import { QueryKeys } from '@/config/tanstack/queryKeys';
import creativeTaskService from '@services/creativetasks/creativetasks.service';
import { useQuery } from '@tanstack/react-query';

export function useCreativeTask(id: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.CREATIVE_TASK, id],
    queryFn: () => creativeTaskService.getCreativeTask(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    task: data?.data ?? null,
  };
}
