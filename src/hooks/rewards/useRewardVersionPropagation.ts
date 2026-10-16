import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rewardsControllerGetRewardUsages } from "@/api/generated/rewards/rewards";
import { eventCompetitionsControllerUpdateVersions } from "@/api/generated/project/project";
import { sprintsControllerUpdateRewardVersions } from "@/api/generated/sprints/sprints";
import { MutationKeys } from "@/config/tanstack/mutationKeys";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { ApiError } from "@/types";

export type RewardUsageTarget = {
  id: string;
  name: string;
  kind: "sprint" | "event";
};

export function useRewardUsageTargets(
  roomId: string,
  rewardId: string,
  enabled = true,
) {
  const query = useQuery({
    queryKey: [QueryKeys.REWARD_USAGE_TARGETS, roomId, rewardId],
    enabled: enabled && Boolean(roomId) && Boolean(rewardId),
    staleTime: 15_000,
    queryFn: async ({ signal }) => {
      const response = await rewardsControllerGetRewardUsages(
        rewardId,
        undefined,
        signal,
      );
      const targets = new Map<string, RewardUsageTarget>();

      response.items.forEach((usage) => {
        if (
          usage.isDeleted ||
          !usage.isActive ||
          !usage.hasNewVersion ||
          usage.isDraft ||
          usage.status !== "active"
        ) {
          return;
        }

        const kind = usage.sprintId ? "sprint" : "event";
        const id = usage.sprintId ?? usage.eventId;
        if (!id) return;

        const key = `${kind}:${id}`;
        targets.set(key, {
          id,
          kind,
          name:
            usage.competitionName ??
            (kind === "sprint" ? "Спринт без названия" : "Событие без названия"),
        });
      });

      return [...targets.values()];
    },
  });

  return {
    targets: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useApplyRewardVersions(roomId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [MutationKeys.APPLY_REWARD_VERSIONS],
    mutationFn: async ({
      rewardId,
      targets,
    }: {
      rewardId: string;
      targets: RewardUsageTarget[];
    }) => {
      await Promise.all(
        targets.map((target) =>
          target.kind === "sprint"
            ? sprintsControllerUpdateRewardVersions(target.id, {
                rewardIds: [rewardId],
              })
            : eventCompetitionsControllerUpdateVersions(target.id, {
                rewardIds: [rewardId],
              }),
        ),
      );
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.REWARD_USAGE_TARGETS, roomId],
        }),
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.SPRINT_REWARD_RULES],
        }),
        queryClient.invalidateQueries({ queryKey: ["competition"] }),
      ]),
  });

  const error = mutation.error;
  return {
    applyRewardVersions: mutation.mutate,
    isPending: mutation.isPending,
    generalError:
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "",
  };
}
