import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomRegistrationQuestionsControllerReplace } from "@/api/generated/room-registration-questions/room-registration-questions";
import type { ReplaceRegistrationQuestionsDto } from "@/api/generated/model";
import { QueryKeys } from "@/config/tanstack/queryKeys";

export function useReplaceRegistrationQuestions(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["replaceRegistrationQuestions", roomId],
    mutationFn: (data: ReplaceRegistrationQuestionsDto) =>
      roomRegistrationQuestionsControllerReplace(roomId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.ROOMS, roomId] });
    },
  });
}
