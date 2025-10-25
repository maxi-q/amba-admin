import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';

import roomsService from "@services/rooms/rooms.service";
import type { IUpdateRoomsRequest } from "@services/rooms/rooms.types";
import { ApiError } from "@/types";

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  const { mutate: updateRoom, isPending, error, isSuccess } = useMutation({
    mutationKey: [MutationKeys.UPDATE_ROOM],
    mutationFn: ({ data, id }: { data: IUpdateRoomsRequest; id: string }) => roomsService.updateRooms(data, id),
    onSuccess: (updatedRoom, variables) => {
      if (updatedRoom) {
        // Update the specific room in the rooms list
        queryClient.setQueryData([QueryKeys.ROOMS], (old: any) => {
          if (Array.isArray(old)) {
            return old.map(room => 
              room.id === variables.id ? updatedRoom : room
            );
          }
          return old;
        });
        
        // Invalidate the specific room query if it exists
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.ROOMS, variables.id]
        });
      }
    }
  });

  const isValidationError = useMemo(() =>
    error instanceof ApiError && error.statusCode === 422,
    [error]
  );

  const validationErrors = useMemo(() =>
    error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {},
    [error]
  );

  const generalError = useMemo(() =>
    error instanceof ApiError && error.statusCode !== 422 ? error.message : '',
    [error]
  );

  return {
    updateRoom,
    isPending,
    error,
    isSuccess,
    isValidationError,
    validationErrors,
    generalError
  };
}
