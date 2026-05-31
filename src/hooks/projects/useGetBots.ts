import { QueryKeys } from '@/config/tanstack/queryKeys';
import { projectsControllerGetProjectBots } from '@/api/generated/projects/projects';
import { useQuery } from '@tanstack/react-query';

type ProjectBot = {
  bot_id: string;
  title: string;
  date: string;
  active: string;
  published: string;
  tags: string[];
};

type ProjectBotsResponse = {
  items?: ProjectBot[];
  count?: number;
};

export function useGetBots() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.BOTS],
    queryFn: () => projectsControllerGetProjectBots() as Promise<ProjectBotsResponse>,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  const bots = data?.items ?? [];
  const count = data?.count ?? 0;

  return {
    isLoading,
    isError,
    error,
    bots,
    count,
  };
}
