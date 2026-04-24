import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { SettingsLoadingState } from "../settings/components/SettingsLoadingState";
import { SettingsErrorState } from "../settings/components/SettingsErrorState";
import { SettingsNotFoundState } from "../settings/components/SettingsNotFoundState";
import { FormForSiteSection } from "../settings/components/FormForSiteSection";

export default function CodePage() {
  const { slug } = useParams();

  const {
    room,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError
  } = useGetRoomById(slug || "");

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Скопировано в буфер обмена");
    } catch (error) {
      console.error("Ошибка при копировании:", error);
      toast.error("Не удалось скопировать в буфер обмена");
    }
  };

  if (isLoadingRoom) {
    return <SettingsLoadingState />;
  }

  if (isRoomError) {
    return <SettingsErrorState errorMessage={roomError?.message} />;
  }

  if (!room) {
    return <SettingsNotFoundState />;
  }

  return (
    <div className="w-full px-2 py-4 md:py-6">
      <FormForSiteSection roomId={room.id} onCopy={handleCopyToClipboard} />
    </div>
  );
}
