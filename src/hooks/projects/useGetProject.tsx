import { QueryKeys } from '@/config/tanstack/queryKeys';
import { projectsControllerGetMyRoute } from '@/api/generated/projects/projects';
import { useQuery } from '@tanstack/react-query';

export function useGetProject() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.PROJECT],
    queryFn: () => projectsControllerGetMyRoute(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    project: data,
  };
}
