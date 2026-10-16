import { useQuery } from "@tanstack/react-query";

import {
  getRoomSenlerIoControllerChannelsQueryKey,
  getRoomSenlerIoControllerLinksQueryKey,
  roomSenlerIoControllerChannels,
  roomSenlerIoControllerLinks,
} from "@/api/generated/room-senler-io/room-senler-io";

export function useRoomSenlerIoChannels(roomId: string) {
  return useQuery({
    queryKey: getRoomSenlerIoControllerChannelsQueryKey(roomId),
    queryFn: ({ signal }) => roomSenlerIoControllerChannels(roomId, undefined, signal),
    enabled: Boolean(roomId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRoomSenlerIoPreapprovedLinks(roomId: string, channelId: string, enabled: boolean) {
  return useQuery({
    queryKey: getRoomSenlerIoControllerLinksQueryKey(roomId, channelId),
    queryFn: ({ signal }) => roomSenlerIoControllerLinks(roomId, channelId, undefined, signal),
    enabled: enabled && Boolean(roomId && channelId),
    staleTime: 5 * 60 * 1000,
  });
}
