import { QueryKeys } from '@/config/tanstack/queryKeys';
import { projectsControllerGetProjectBots } from '@/api/generated/projects/projects';
import { useQuery } from '@tanstack/react-query';
import { useGetProject } from './useGetProject';
import { supportsSenlerRuAutomation } from '@/services/projects/projects.types';

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
  const { project } = useGetProject();
  const isSupported = supportsSenlerRuAutomation(project);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.BOTS, project?.id],
    queryFn: () => projectsControllerGetProjectBots() as Promise<ProjectBotsResponse>,
    enabled: isSupported,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  const bots = data?.items ?? [];
  const count = data?.count ?? 0;

  return {
    isSupported,
    isLoading,
    isError,
    error,
    bots,
    count,
  };
}
