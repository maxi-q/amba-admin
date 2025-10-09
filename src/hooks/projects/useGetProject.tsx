import { QueryKeys } from '@/config/tanstack/queryKeys';
import projectsService from '@/services/projects/projects.service';
import { useQuery } from '@tanstack/react-query';

export function useGetProject() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.PROJECT],
    queryFn: () => projectsService.getProject(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    project: data?.data,
  };
}
