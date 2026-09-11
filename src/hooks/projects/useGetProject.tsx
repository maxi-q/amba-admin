import { QueryKeys } from '@/config/tanstack/queryKeys';
import { customInstance } from '@/api/mutator/custom-instance';
import type { IGetProjectResponse } from '@/services/projects/projects.types';
import { useQuery } from '@tanstack/react-query';

export function useGetProject() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.PROJECT],
    queryFn: () => customInstance<IGetProjectResponse>({ url: '/api/projects/my', method: 'GET' }),
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
