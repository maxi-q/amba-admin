import { useQuery } from "@tanstack/react-query";

import { roomRegistrationQuestionsControllerAnswers } from "@/api/generated/room-registration-questions/room-registration-questions";
import { QueryKeys } from "@/config/tanstack/queryKeys";

export function useRegistrationAnswers(roomId: string, ambassadorRoomId: string, enabled = true) {
  return useQuery({
    queryKey: [QueryKeys.REGISTRATION_ANSWERS, roomId, ambassadorRoomId],
    queryFn: ({ signal }) =>
      roomRegistrationQuestionsControllerAnswers(roomId, ambassadorRoomId, undefined, signal),
    enabled: enabled && Boolean(roomId && ambassadorRoomId),
  });
}
