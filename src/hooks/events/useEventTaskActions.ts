import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateEventTaskDto, UpdateEventTaskDto } from "@/api/generated/model";
import {
  eventTasksControllerCreate,
  eventTasksControllerRemove,
  eventTasksControllerUpdate,
} from "@/api/generated/event-tasks/event-tasks";
import { eventTasksQueryKey } from "./useEventTasks";

type EventTaskAction =
  | { type: "create"; data: CreateEventTaskDto }
  | { type: "update"; taskId: string; data: UpdateEventTaskDto }
  | { type: "remove"; taskId: string };

export function useEventTaskActions(eventId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (action: EventTaskAction) => {
      if (action.type === "create") await eventTasksControllerCreate(eventId, action.data);
      else if (action.type === "update") await eventTasksControllerUpdate(eventId, action.taskId, action.data);
      else await eventTasksControllerRemove(eventId, action.taskId);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: eventTasksQueryKey(eventId) }),
  });
}
