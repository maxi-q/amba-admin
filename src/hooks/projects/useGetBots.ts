import { QueryKeys } from '@/config/tanstack/queryKeys';
import projectsService from '@/services/projects/projects.service';
import { useQuery } from '@tanstack/react-query';

export function useGetBots() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.BOTS],
    queryFn: () => projectsService.getBots(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  const bots = data?.data?.items ?? [];
  const count = data?.data?.count ?? 0;

  return {
    isLoading,
    isError,
    error,
    bots,
    count,
  };
}
