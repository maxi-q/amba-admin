import { useMutation } from "@tanstack/react-query";
import { afterRegistrationInvitationsControllerParseVkUserId } from "@/api/generated/after-registration-invitations/after-registration-invitations";

export function useParseVkUserId() {
  return useMutation({ mutationFn: (input: string) => afterRegistrationInvitationsControllerParseVkUserId({ input }) });
}
