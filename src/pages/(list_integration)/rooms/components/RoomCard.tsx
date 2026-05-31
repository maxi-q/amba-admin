import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import type { BaseRoomDto } from "@/api/generated/model";

interface RoomCardProps {
  room: BaseRoomDto;
}

export const RoomCard = ({ room }: RoomCardProps) => {
  return (
    <Link
      to={`/rooms/${room.id}`}
      className="mb-3 flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-primary"
    >
      <span className="text-sm font-normal">{room.name}</span>
      <Pencil className="size-4 shrink-0 text-primary" aria-hidden />
    </Link>
  );
};
