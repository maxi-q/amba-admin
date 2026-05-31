import { QueryKeys } from '@/config/tanstack/queryKeys';
import { creativeTasksControllerGetSubmissionById } from '@/api/generated/creative-tasks/creative-tasks';
import { useQuery } from '@tanstack/react-query';

export function useSubmission(submissionId: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.SUBMISSION, submissionId],
    queryFn: () => creativeTasksControllerGetSubmissionById(submissionId),
    enabled: !!submissionId,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    submission: data ?? null,
  };
}
